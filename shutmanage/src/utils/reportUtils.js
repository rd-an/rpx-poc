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

const DEFAULT_POLICY = {
  normalShutdownStart: "17:00",
  normalShutdownEnd: "19:00",
  overtimeShutdownStart: "19:00",
  overtimeShutdownEnd: "21:00"
};

export const normalizePolicy = (policy) => {
  if (!policy || typeof policy !== "object") return { ...DEFAULT_POLICY };

  const next = { ...DEFAULT_POLICY };
  const hasNewPolicyShape = Object.keys(DEFAULT_POLICY).some((key) => typeof policy[key] === "string");

  if (!hasNewPolicyShape) {
    return next;
  }

  Object.keys(DEFAULT_POLICY).forEach((key) => {
    if (typeof policy[key] === "string" && policy[key]) {
      next[key] = policy[key];
    }
  });

  return next;
};

export const getUniqueOptions = (rows, key) =>
  [...new Set(rows.map((row) => row[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh-Hant"));

export const timeToMinutes = (value) => {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const extractTime = (datetime) => (datetime ? datetime.slice(11, 16) : "");

const isMinuteInRange = (minutes, start, end) => {
  if (minutes === null || start === null || end === null) return false;
  return minutes >= start && minutes < end;
};

export const summarizePolicyRules = (policy) => {
  const normalized = normalizePolicy(policy);
  return `${normalized.normalShutdownStart}-${normalized.normalShutdownEnd} 正常關機 / ${normalized.overtimeShutdownStart}-${normalized.overtimeShutdownEnd} 加班關機 / ${normalized.overtimeShutdownEnd} 後未關機`;
};

export const validatePolicy = (policy) => {
  const normalized = normalizePolicy(policy);
  const errors = {};

  const normalStart = timeToMinutes(normalized.normalShutdownStart);
  const normalEnd = timeToMinutes(normalized.normalShutdownEnd);
  const overtimeStart = timeToMinutes(normalized.overtimeShutdownStart);
  const overtimeEnd = timeToMinutes(normalized.overtimeShutdownEnd);

  if (normalStart === null) {
    errors.normalShutdownStart = "請設定正常關機開始時間。";
  }

  if (normalEnd === null) {
    errors.normalShutdownEnd = "請設定正常關機結束時間。";
  }

  if (overtimeStart === null) {
    errors.overtimeShutdownStart = "請設定加班關機開始時間。";
  }

  if (overtimeEnd === null) {
    errors.overtimeShutdownEnd = "請設定未關機判定的截止時間。";
  }

  if (normalStart !== null && normalEnd !== null && normalStart >= normalEnd) {
    errors.normalShutdownEnd = "正常關機結束時間必須晚於開始時間。";
  }

  if (overtimeStart !== null && overtimeEnd !== null && overtimeStart >= overtimeEnd) {
    errors.overtimeShutdownEnd = "加班關機截止時間必須晚於開始時間。";
  }

  if (normalEnd !== null && overtimeStart !== null && normalEnd !== overtimeStart) {
    errors.overtimeShutdownStart = "加班關機開始時間需與正常關機結束時間銜接。";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    summary: summarizePolicyRules(normalized)
  };
};

export const deriveDeviceStatus = (device, policy) => {
  const normalizedPolicy = normalizePolicy(policy);
  const normalStart = timeToMinutes(normalizedPolicy.normalShutdownStart);
  const normalEnd = timeToMinutes(normalizedPolicy.normalShutdownEnd);
  const overtimeStart = timeToMinutes(normalizedPolicy.overtimeShutdownStart);
  const overtimeEnd = timeToMinutes(normalizedPolicy.overtimeShutdownEnd);

  if (!device.managed) return "未納管";
  if (!device.canShutdown) return "不可關機";
  if (device.excludedByGroup) return "群組排除";
  if (device.triggeredShutdownAt) return "已觸發關機";
  if (!device.shutdownAt) return "未關機";

  const shutdownMinutes = timeToMinutes(extractTime(device.shutdownAt));
  if (isMinuteInRange(shutdownMinutes, normalStart, normalEnd)) return "正常關機";
  if (isMinuteInRange(shutdownMinutes, overtimeStart, overtimeEnd)) return "加班後關機";
  return "未關機";
};

const countByStatus = (devices, policy, status) =>
  devices.filter((device) => deriveDeviceStatus(device, policy) === status).length;

export const buildReportSummary = (devices, policy) => {
  const managedDevices = devices.filter((device) => device.managed);
  const shutdownBase = managedDevices.filter((device) => device.canShutdown && !device.excludedByGroup).length;
  const normalShutdown = countByStatus(devices, policy, "正常關機");
  const overtimeShutdown = countByStatus(devices, policy, "加班後關機");
  const unshutdown = countByStatus(devices, policy, "未關機");
  const cannotShutdown = countByStatus(devices, policy, "不可關機");
  const excludedByGroup = countByStatus(devices, policy, "群組排除");
  const triggered = countByStatus(devices, policy, "已觸發關機");
  const completed = normalShutdown + overtimeShutdown + triggered;
  const shutdownRate = shutdownBase === 0 ? "0%" : `${Math.round((completed / shutdownBase) * 100)}%`;

  return {
    totalDevices: devices.length,
    managedDevices: managedDevices.length,
    shutdownBase,
    normalShutdown,
    overtimeShutdown,
    cannotShutdown,
    excludedByGroup,
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
      label: "群組排除數",
      value: summary.excludedByGroup,
      badge: "政策例外",
      badgeClass: "bg-[#eef2f6] text-[#5c6e80]",
      description: "屬於納管範圍，但依群組旗標排除在關機 KPI 之外。"
    },
    {
      label: "應關機未關機",
      value: summary.unshutdown,
      badge: "需追蹤",
      badgeClass: "bg-[#fff5df] text-[#9a6a00]",
      description: "逾時才關機或沒有關機紀錄的可關機設備。"
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
        excludedByGroup: summary.excludedByGroup,
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

export const exportDetailReport = (deviceRows, meta) => {
  let csv =
    "稽核日期,作用中群組,電腦名稱,資產編號,納管群組,部門,單位,院區,區域,設備屬性,開機時間,關機時間,狀態,群組排除,觸發關機時間,備註\n";

  deviceRows.forEach((device) => {
    csv += [
      meta.auditDate,
      meta.scopeName,
      device.hostname,
      device.assetTag,
      device.groupName,
      device.department,
      device.unit,
      device.site,
      device.area,
      device.attribute,
      device.bootAt,
      device.shutdownAt || "",
      device.derivedStatus,
      device.excludedByGroup ? "是" : "否",
      device.triggeredShutdownAt || "",
      `"${device.notes}"`
    ].join(",") + "\n";
  });

  downloadBlob(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }), `shutmanage-detail-${meta.auditDate}.csv`);
};

export const exportSummaryReport = (summary, scopeSummaryRows, meta) => {
  const workbook = XLSX.utils.book_new();

  const overview = XLSX.utils.aoa_to_sheet([
    ["稽核日期", meta.auditDate],
    ["報表類型", "全部納管 / 各納管群組稽核總計表"],
    ["全院設備總數", summary.totalDevices],
    ["納管設備數", summary.managedDevices],
    ["正常關機", summary.normalShutdown],
    ["不可關機", summary.cannotShutdown],
    ["群組排除", summary.excludedByGroup],
    ["加班後關機", summary.overtimeShutdown],
    ["未關機", summary.unshutdown],
    ["最終觸發關機", summary.triggered],
    ["關機率", summary.shutdownRate]
  ]);
  XLSX.utils.book_append_sheet(workbook, overview, "總覽");

  const scopeSheet = XLSX.utils.json_to_sheet(
    scopeSummaryRows.map((row) => ({
      納管群組: row.scopeName,
      群組說明: row.scopeDescription,
      例外群組: row.excludeFromShutdownPolicy ? "是" : "否",
      納管設備數: row.managed,
      正常關機: row.normalShutdown,
      加班後關機: row.overtimeShutdown,
      未關機: row.unshutdown,
      群組排除: row.excludedByGroup,
      不可關機: row.cannotShutdown,
      已觸發關機: row.triggered,
      關機率: row.shutdownRate
    }))
  );
  XLSX.utils.book_append_sheet(workbook, scopeSheet, "群組統計");

  XLSX.writeFile(workbook, `shutmanage-summary-${meta.auditDate}.xlsx`);
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
