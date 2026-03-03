import * as XLSX from "xlsx";

function downloadCSV(csvContent, fileName) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportContextAware(state) {
  const { layer, secondLayerMode, selectedOs, selectedKb, selectedDevice, osSummaries, kbRows, unpatchedDeviceRows } = state;
  let csv = "";
  let fileName = "";

  if (layer === 1) {
    csv = "作業系統,電腦總數,高風險項目,未修正項目,整體修正率\n";
    osSummaries.forEach(s => {
      csv += `${s.osName},${s.total},${s.highRisk},${s.unpatched},${s.patchRate}\n`;
    });
    fileName = "OS分類匯總.csv";
  } else if (layer === 2) {
    if (secondLayerMode === "kb-list") {
      csv = "KB 編號,更新說明,風險等級,缺漏裝置數\n";
      kbRows.forEach(k => {
        csv += `${k.id},"${k.title}",${k.severity},${k.affectedCount}\n`;
      });
      fileName = `${selectedOs.osName}_KB編號清單.csv`;
    } else {
      csv = "裝置名稱,IP,風險等級,未安裝 KB 數\n";
      unpatchedDeviceRows.forEach(d => {
        csv += `${d.hostname},${d.ip},${d.risk},${d.missingKbs.length}\n`;
      });
      fileName = `${selectedOs.osName}_缺漏安裝清單.csv`;
    }
  } else {
    // layer 3
    if (secondLayerMode === "kb-list") {
       if (selectedDevice) {
         // specific device details
         csv = `裝置名稱:${selectedDevice.hostname}\nIP:${selectedDevice.ip}\n風險等級:${selectedDevice.risk}\n負責單位:${selectedDevice.owner}\n\n`;
         csv += "缺漏 KB,更新說明\n";
         selectedDevice.missingKbs.forEach(kbId => {
           const title = selectedOs.kbCatalog.find(k => k.id === kbId)?.title || "-";
           csv += `${kbId},"${title}"\n`;
         });
         fileName = `${selectedDevice.hostname}_缺漏明細.csv`;
       } else {
         csv = "裝置名稱,IP,風險等級,負責單位,最後回報時間\n";
         selectedKb.affectedDevices.forEach(d => {
           csv += `${d.hostname},${d.ip},${d.risk},${d.owner},${d.lastSeen}\n`;
         });
         fileName = `${selectedKb.id}_缺漏裝置清單.csv`;
       }
    } else {
       csv = `裝置名稱:${selectedDevice.hostname}\nIP:${selectedDevice.ip}\n風險等級:${selectedDevice.risk}\n負責單位:${selectedDevice.owner}\n最後回報時間:${selectedDevice.lastSeen}\n\n`;
       csv += "缺漏 KB,更新說明\n";
       selectedDevice.missingKbs.forEach(kbId => {
         const title = selectedOs.kbCatalog.find(k => k.id === kbId)?.title || "-";
         csv += `${kbId},"${title}"\n`;
       });
       fileName = `${selectedDevice.hostname}_缺漏明細.csv`;
    }
  }

  downloadCSV(csv, fileName);
}

export function exportFlatCSV(osGroups) {
  let csv = "作業系統,裝置名稱,IP,負責單位,裝置風險,最後回報時間,缺漏 KB 編號,KB 風險,KB 說明\n";
  
  osGroups.forEach(os => {
    os.assets.forEach(device => {
      if (device.missingKbs.length > 0) {
        device.missingKbs.forEach(kbId => {
          const kbInfo = os.kbCatalog.find(k => k.id === kbId);
          const kbRisk = kbInfo ? kbInfo.severity : "-";
          const kbTitle = kbInfo ? kbInfo.title : "-";
          csv += `${os.osName},${device.hostname},${device.ip},${device.owner},${device.risk},${device.lastSeen},${kbId},${kbRisk},"${kbTitle}"\n`;
        });
      }
    });
  });

  downloadCSV(csv, "KB安裝稽核總表_攤平.csv");
}

export function exportMultiSheetExcel(osGroups, osSummaries) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 總覽
  const ws1Data = [["作業系統", "電腦總數", "高風險項目", "未修正項目", "整體修正率"]];
  osSummaries.forEach(s => {
    ws1Data.push([s.osName, s.total, s.highRisk, s.unpatched, s.patchRate]);
  });
  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  XLSX.utils.book_append_sheet(wb, ws1, "總覽");

  // Sheet 2: KB 統計
  const ws2Data = [["作業系統", "KB 編號", "更新說明", "風險等級", "缺漏裝置數"]];
  osGroups.forEach(os => {
    const kbStats = os.kbCatalog.map(kb => {
      const affected = os.assets.filter(a => a.missingKbs.includes(kb.id)).length;
      return { ...kb, affectedCount: affected };
    }).filter(k => k.affectedCount > 0).sort((a, b) => b.affectedCount - a.affectedCount);

    kbStats.forEach(kb => {
      ws2Data.push([os.osName, kb.id, kb.title, kb.severity, kb.affectedCount]);
    });
  });
  const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
  XLSX.utils.book_append_sheet(wb, ws2, "KB統計");

  // Sheet 3: 設備明細
  const ws3Data = [["作業系統", "裝置名稱", "IP", "負責單位", "裝置風險", "最後回報時間", "缺漏 KB 編號", "KB 風險", "KB 說明"]];
  osGroups.forEach(os => {
    os.assets.forEach(device => {
      device.missingKbs.forEach(kbId => {
        const kbInfo = os.kbCatalog.find(k => k.id === kbId);
        const kbRisk = kbInfo ? kbInfo.severity : "-";
        const kbTitle = kbInfo ? kbInfo.title : "-";
        ws3Data.push([os.osName, device.hostname, device.ip, device.owner, device.risk, device.lastSeen, kbId, kbRisk, kbTitle]);
      });
    });
  });
  const ws3 = XLSX.utils.aoa_to_sheet(ws3Data);
  XLSX.utils.book_append_sheet(wb, ws3, "設備明細");

  XLSX.writeFile(wb, "KB安裝稽核報表.xlsx");
}
