import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export const normalizeFilters = (filters) => ({
  auditDate: filters.auditDate || "2026-03-16",
  scopeId: filters.scopeId || "all",
  groupName: filters.groupName || "",
  site: filters.site || "",
  department: filters.department || "",
  unit: filters.unit || "",
  area: filters.area || "",
  attribute: filters.attribute || "",
  powerClass: filters.powerClass || "",
  status: filters.status || ""
});

export const getUniqueOptions = (rows, key) =>
  [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));

export const timeToMinutes = (value) => {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const extractTime = (datetime) => (datetime ? datetime.slice(11, 16) : "");

const isNightWindow = (minutes, policy) => {
  if (minutes === null) return false;

  const nightStart = timeToMinutes(policy.nightStart);
  const nightEnd = timeToMinutes(policy.nightEnd);

  if (nightStart <= nightEnd) {
    return minutes >= nightStart && minutes <= nightEnd;
  }

  return minutes >= nightStart || minutes <= nightEnd;
};

export const deriveDeviceStatus = (device, policy) => {
  if (!device.managed) return "未納管";
  if (!device.canShutdown) return "不可關機";
  if (!device.shutdownAt) return device.triggeredShutdownAt ? "已觸發關機" : "未關機";

  const shutdownMinutes = timeToMinutes(extractTime(device.shutdownAt));
  return isNightWindow(shutdownMinutes, policy) ? "加班後關機" : "正常關機";
};

const countByStatus = (devices, policy, status) =>
  devices.filter((device) => deriveDeviceStatus(device, policy) === status).length;

export const buildReportSummary = (devices, policy) => {
  const managedDevices = devices.filter((device) => device.managed);
  const shutdownBase = managedDevices.filter((device) => device.canShutdown).length;
  const normalShutdown = countByStatus(devices, policy, "正常關機");
  const overtimeShutdown = countByStatus(devices, policy, "加班後關機");
  const unshutdown = countByStatus(devices, policy, "未關機");
  const cannotShutdown = countByStatus(devices, policy, "不可關機");
  const triggered = managedDevices.filter((device) => Boolean(device.triggeredShutdownAt)).length;
  const completed = normalShutdown + overtimeShutdown + triggered;
  const shutdownRate = shutdownBase === 0 ? "0%" : `${Math.round((completed / shutdownBase) * 100)}%`;

  return {
    totalDevices: devices.length,
    managedDevices: managedDevices.length,
    shutdownBase,
    normalShutdown,
    overtimeShutdown,
    cannotShutdown,
    unshutdown,
    triggered,
    shutdownRate
  };
};

export const buildSummaryCards = (devices, policy) => {
  const summary = buildReportSummary(devices, policy);

  return [
    {
      label: "全院設備總數",
      value: summary.totalDevices,
      badge: "篩選結果",
      badgeClass: "bg-[#eef3f8] text-[#5b6c7d]",
      description: "目前條件下可檢視的院內設備總量。"
    },
    {
      label: "納管設備數",
      value: summary.managedDevices,
      badge: "政策範圍",
      badgeClass: "bg-[#e8f3ff] text-[#2f6aa7]",
      description: "符合納管條件並列入關機政策追蹤。"
    },
    {
      label: "應關機未關機",
      value: summary.unshutdown,
      badge: "需追蹤",
      badgeClass: "bg-[#fff5df] text-[#9a6a00]",
      description: "可關機設備於稽核時間點仍未關機。"
    },
    {
      label: "最終觸發關機",
      value: summary.triggered,
      badge: "政策補救",
      badgeClass: "bg-[#fcecf2] text-[#bb4c78]",
      description: "夜間由政策自動補觸發關機。"
    },
    {
      label: "不可關機設備",
      value: summary.cannotShutdown,
      badge: "例外名單",
      badgeClass: "bg-[#eef1f4] text-[#5e6d7c]",
      description: "ICU、臨床或特殊用途設備。"
    }
  ];
};

export const buildDepartmentRows = (devices, policy) => {
  const groups = devices.reduce((result, device) => {
    const key = device.department;
    result[key] = result[key] || [];
    result[key].push(device);
    return result;
  }, {});

  return Object.entries(groups)
    .map(([department, rows]) => {
      const summary = buildReportSummary(rows, policy);
      return {
        department,
        total: rows.length,
        managed: summary.managedDevices,
        cannotShutdown: summary.cannotShutdown,
        normalShutdown: summary.normalShutdown,
        overtimeShutdown: summary.overtimeShutdown,
        unshutdown: summary.unshutdown,
        triggered: summary.triggered
      };
    })
    .sort((a, b) => a.department.localeCompare(b.department, "zh-Hant"));
};

export const summarizeScopeCriteria = (criteria = {}) => {
  const labels = {
    site: "院區",
    department: "部門",
    unit: "單位",
    area: "區域",
    attribute: "設備屬性",
    groupName: "設備群組",
    canShutdown: "關機分類"
  };

  const parts = Object.entries(criteria)
    .filter(([, value]) => value !== "" && value !== null && value !== undefined)
    .map(([key, value]) => `${labels[key]}：${value === true ? "可關機" : value === false ? "不可關機" : value}`);

  return parts.length ? parts.join(" / ") : "目前為全院總覽，未限制特定群組。";
};

const downloadBlob = (blob, fileName) => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportAuditCsv = (deviceRows, meta) => {
  let csv =
    "稽核日期,作用中群組,電腦名稱,資產編號,部門,單位,院區,區域,設備屬性,開機時間,關機時間,狀態,觸發關機時間,備註\n";

  deviceRows.forEach((device) => {
    csv += [
      meta.auditDate,
      meta.scopeName,
      device.hostname,
      device.assetTag,
      device.department,
      device.unit,
      device.site,
      device.area,
      device.attribute,
      device.bootAt,
      device.shutdownAt || "",
      device.derivedStatus,
      device.triggeredShutdownAt || "",
      `"${device.notes}"`
    ].join(",") + "\n";
  });

  downloadBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }), `shutmanage-audit-${meta.auditDate}.csv`);
};

export const exportAuditExcel = (summary, departmentRows, deviceRows, meta) => {
  const workbook = XLSX.utils.book_new();

  const overview = XLSX.utils.aoa_to_sheet([
    ["稽核日期", meta.auditDate],
    ["作用中群組", meta.scopeName],
    ["全院設備總數", summary.totalDevices],
    ["納管設備數", summary.managedDevices],
    ["正常關機", summary.normalShutdown],
    ["不可關機", summary.cannotShutdown],
    ["加班後關機", summary.overtimeShutdown],
    ["未關機", summary.unshutdown],
    ["最終觸發關機", summary.triggered],
    ["關機率", summary.shutdownRate]
  ]);
  XLSX.utils.book_append_sheet(workbook, overview, "總覽");

  const departmentSheet = XLSX.utils.json_to_sheet(departmentRows);
  XLSX.utils.book_append_sheet(workbook, departmentSheet, "部門明細");

  const deviceSheet = XLSX.utils.json_to_sheet(
    deviceRows.map((device) => ({
      電腦名稱: device.hostname,
      資產編號: device.assetTag,
      部門: device.department,
      單位: device.unit,
      院區: device.site,
      區域: device.area,
      設備屬性: device.attribute,
      開機時間: device.bootAt,
      關機時間: device.shutdownAt || "—",
      狀態: device.derivedStatus,
      觸發關機時間: device.triggeredShutdownAt || "未觸發",
      備註: device.notes
    }))
  );
  XLSX.utils.book_append_sheet(workbook, deviceSheet, "設備明細");

  XLSX.writeFile(workbook, `shutmanage-audit-${meta.auditDate}.xlsx`);
};

export const exportAuditPdf = async (element, meta) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff"
  });

  const imageData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const scaledHeight = (canvas.height * usableWidth) / canvas.width;

  let remainingHeight = scaledHeight;
  let yOffset = 0;

  pdf.setFontSize(12);
  pdf.text(`Audit Date: ${meta.auditDate} / Scope: ${meta.scopeName}`, margin, 8);

  pdf.addImage(imageData, "PNG", margin, 12, usableWidth, scaledHeight);
  remainingHeight -= pageHeight - 12;

  while (remainingHeight > 0) {
    yOffset += pageHeight - 12;
    pdf.addPage();
    pdf.addImage(imageData, "PNG", margin, 12 - yOffset, usableWidth, scaledHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(`shutmanage-audit-${meta.auditDate}.pdf`);
};
