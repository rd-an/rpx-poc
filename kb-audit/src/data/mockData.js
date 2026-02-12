export const sidebarSections = [
  {
    title: "組態整合",
    icon: "⚙",
    active: true
  },
  {
    title: "部署稽核",
    icon: "🖥",
    active: false
  },
  {
    title: "還原設定",
    icon: "◔",
    active: false
  },
  {
    title: "Policy",
    icon: "🛡",
    active: false
  }
];

export const softwareMenu = [
  { label: "安裝統計", icon: "☑", view: "install-stats" },
  { label: "使用統計", icon: "☰" },
  { label: "使用紀錄", icon: "◔" },
  { label: "擴充檢查", icon: "☷" },
  { label: "黑名單", icon: "!" },
  { label: "變更紀錄", icon: "▦" }
];

export const weaknessMenu = [{ label: "KB 安裝稽核列表", icon: "⌕", view: "kb-audit" }];

export const tabs = ["安裝統計", "軟體群組"];

export const installStatsRows = [
  ["Microsoft OneDrive", "25.222.1112.0002", 1],
  ["RapiXEngine.2.12.4", "2.12.4", 7],
  ["Microsoft Update Health Tools", "5.72.0.0", 1],
  ["Windows Defender", "4.18.25110.6", 5],
  ["Microsoft Edge", "143.0.3650.96", 3],
  ["Windows Defender", "4.18.1909.6", 1],
  ["Microsoft Visual C++ 2015-2022 Redistributable (x86)", "14.36.32532.0", 3],
  ["Microsoft Visual C++ 2015-2022 Redistributable (x64)", "14.36.32532.0", 3],
  ["Microsoft Update Health Tools", "3.74.0.0", 2],
  ["VMware Tools", "12.4.0.23259341", 2],
  ["internet_explorer", "11.4350.14393.0", 1],
  ["Google Chrome", "143.0.7499.170", 2],
  ["VMware Tools", "12.3.5.22544099", 1],
  ["internet_explorer", "11.1.20348.0", 2],
  ["libgcc", "11.5.0", 1],
  ["linux-firmware-whence", "20250314", 1],
  ["Microsoft OneDrive", "24.198.1001.0003", 4],
  ["Microsoft 365 Apps", "16.0.18227.20162", 6],
  ["Mozilla Firefox", "132.0.2", 2],
  ["Notepad++", "8.6.4", 3]
];

export const kbAuditOsGroups = [
  {
    osName: "Windows 10 22H2",
    assets: [
      { hostname: "W10-ENG-001", ip: "10.10.12.11", risk: "高", owner: "IT-OPS", lastSeen: "2026-02-11 09:13", missingKbs: ["KB5039211", "KB5037768"] },
      { hostname: "W10-ENG-014", ip: "10.10.12.57", risk: "中", owner: "IT-OPS", lastSeen: "2026-02-11 09:41", missingKbs: ["KB5039211"] },
      { hostname: "W10-MFG-021", ip: "10.10.18.32", risk: "高", owner: "MFG-IT", lastSeen: "2026-02-11 08:57", missingKbs: ["KB5037768"] },
      { hostname: "W10-MFG-022", ip: "10.10.18.33", risk: "低", owner: "MFG-IT", lastSeen: "2026-02-11 09:02", missingKbs: [] },
      { hostname: "W10-QA-004", ip: "10.10.22.41", risk: "中", owner: "QA-IT", lastSeen: "2026-02-11 09:35", missingKbs: ["KB5039211"] },
      { hostname: "W10-QA-017", ip: "10.10.22.79", risk: "低", owner: "QA-IT", lastSeen: "2026-02-11 09:26", missingKbs: [] }
    ],
    kbCatalog: [
      { id: "KB5039211", title: "2026-01 Cumulative Update", severity: "高" },
      { id: "KB5037768", title: ".NET Security Rollup", severity: "高" },
      { id: "KB5036002", title: "Defender Platform Update", severity: "中" }
    ]
  },
  {
    osName: "Windows 11 23H2",
    assets: [
      { hostname: "W11-ADM-006", ip: "10.11.10.66", risk: "高", owner: "HQ-IT", lastSeen: "2026-02-11 09:29", missingKbs: ["KB5040123"] },
      { hostname: "W11-ADM-010", ip: "10.11.10.70", risk: "中", owner: "HQ-IT", lastSeen: "2026-02-11 09:33", missingKbs: ["KB5040123", "KB5039980"] },
      { hostname: "W11-RD-002", ip: "10.11.14.22", risk: "中", owner: "R&D-IT", lastSeen: "2026-02-11 09:06", missingKbs: [] },
      { hostname: "W11-RD-019", ip: "10.11.14.88", risk: "低", owner: "R&D-IT", lastSeen: "2026-02-11 08:43", missingKbs: ["KB5039980"] },
      { hostname: "W11-RD-024", ip: "10.11.14.96", risk: "高", owner: "R&D-IT", lastSeen: "2026-02-11 09:14", missingKbs: ["KB5040123"] }
    ],
    kbCatalog: [
      { id: "KB5040123", title: "2026-01 Security Update", severity: "高" },
      { id: "KB5039980", title: "Servicing Stack Update", severity: "中" }
    ]
  },
  {
    osName: "Windows Server 2019",
    assets: [
      { hostname: "SRV-ERP-001", ip: "10.30.1.10", risk: "高", owner: "DC-OPS", lastSeen: "2026-02-11 09:11", missingKbs: ["KB5038124", "KB5037001"] },
      { hostname: "SRV-MES-003", ip: "10.30.2.20", risk: "高", owner: "DC-OPS", lastSeen: "2026-02-11 09:09", missingKbs: ["KB5038124"] },
      { hostname: "SRV-AD-002", ip: "10.30.0.12", risk: "中", owner: "AD-TEAM", lastSeen: "2026-02-11 09:31", missingKbs: [] },
      { hostname: "SRV-DB-007", ip: "10.30.3.70", risk: "中", owner: "DBA", lastSeen: "2026-02-11 09:18", missingKbs: ["KB5037001"] }
    ],
    kbCatalog: [
      { id: "KB5038124", title: "Server Security Monthly Rollup", severity: "高" },
      { id: "KB5037001", title: "Kerberos Hardening Update", severity: "高" }
    ]
  }
];
