export const sidebarSections = [
  { title: "節能稽核", icon: "⚙", active: true },
  { title: "資料蒐集", icon: "🖥", active: false },
  { title: "報表匯出", icon: "▣", active: false },
  { title: "政策設定", icon: "🛡", active: false }
];

export const navItems = [
  { label: "關機管理總覽", icon: "⌂", view: "overview" },
  { label: "納管設定", icon: "☰", view: "scope-manager" },
  { label: "稽核報表", icon: "⇩", view: "reports" },
  { label: "趨勢分析", icon: "◔", view: "trend" }
];

export const initialFilters = {
  auditDate: "2026-03-16",
  scopeId: "all",
  groupName: "",
  site: "",
  department: "",
  unit: "",
  area: "",
  attribute: "",
  powerClass: "",
  status: ""
};

export const defaultPolicy = {
  workStart: "08:00",
  workEnd: "18:00",
  nightStart: "21:00",
  nightEnd: "02:00"
};

export const defaultSavedScopes = [
  {
    id: "all",
    name: "全部納管設備",
    description: "檢視全院所有已納管與例外設備，作為院級總覽使用。",
    criteria: {}
  },
  {
    id: "admin-office",
    name: "行政白班設備",
    description: "追蹤行政大樓白班辦公設備的下班關機落實情形。",
    criteria: {
      site: "行政大樓",
      attribute: "行政文書",
      canShutdown: true
    }
  },
  {
    id: "outpatient-nursing",
    name: "門診護理站",
    description: "關注門診護理站與批價櫃檯電腦是否於下班後妥善關機。",
    criteria: {
      department: "護理部",
      groupName: "門診護理群組"
    }
  }
];

export const deviceRecords = [
  {
    id: "pc-001",
    hostname: "ADM-OA-001",
    assetTag: "AST-AD-2201",
    inventoryId: "INV-0001",
    department: "行政處",
    unit: "人資室",
    site: "行政大樓",
    area: "5F 辦公區",
    attribute: "行政文書",
    groupName: "行政白班設備",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 08:03",
    shutdownAt: "2026-03-16 18:16",
    triggeredShutdownAt: "",
    notes: "符合一般下班後關機時間。"
  },
  {
    id: "pc-002",
    hostname: "ADM-OA-014",
    assetTag: "AST-AD-2237",
    inventoryId: "INV-0002",
    department: "行政處",
    unit: "總務組",
    site: "行政大樓",
    area: "3F 總務辦公區",
    attribute: "行政文書",
    groupName: "行政白班設備",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 08:11",
    shutdownAt: "",
    triggeredShutdownAt: "",
    notes: "下班後持續在線，列為應關機未關機。"
  },
  {
    id: "pc-003",
    hostname: "ER-NUR-003",
    assetTag: "AST-ER-3105",
    inventoryId: "INV-0003",
    department: "急診部",
    unit: "急診護理站",
    site: "總院",
    area: "急診大樓 1F",
    attribute: "護理站",
    groupName: "急診護理群組",
    managed: true,
    canShutdown: false,
    bootAt: "2026-03-16 07:43",
    shutdownAt: "",
    triggeredShutdownAt: "",
    notes: "屬於急診交班設備，不納入一般關機政策。"
  },
  {
    id: "pc-004",
    hostname: "OPD-NUR-008",
    assetTag: "AST-OP-4421",
    inventoryId: "INV-0004",
    department: "護理部",
    unit: "門診護理站",
    site: "總院",
    area: "門診大樓 2F",
    attribute: "護理站",
    groupName: "門診護理群組",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 07:56",
    shutdownAt: "2026-03-16 21:34",
    triggeredShutdownAt: "",
    notes: "晚間門診延後結束，屬加班後關機。"
  },
  {
    id: "pc-005",
    hostname: "LAB-WS-002",
    assetTag: "AST-LB-5102",
    inventoryId: "INV-0005",
    department: "檢驗科",
    unit: "檢驗室",
    site: "總院",
    area: "檢驗中心 2F",
    attribute: "檢驗設備",
    groupName: "檢驗工作站群組",
    managed: true,
    canShutdown: false,
    bootAt: "2026-03-16 00:00",
    shutdownAt: "",
    triggeredShutdownAt: "",
    notes: "檢驗儀器連動工作站，24 小時運作。"
  },
  {
    id: "pc-006",
    hostname: "RAD-IMG-011",
    assetTag: "AST-RD-6119",
    inventoryId: "INV-0006",
    department: "影像醫學部",
    unit: "放射科",
    site: "總院",
    area: "影像中心 1F",
    attribute: "醫療檢查",
    groupName: "放射讀片群組",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 08:22",
    shutdownAt: "",
    triggeredShutdownAt: "2026-03-16 23:40",
    notes: "因讀片站未關機，夜間由政策補觸發。"
  },
  {
    id: "pc-007",
    hostname: "FIN-OA-004",
    assetTag: "AST-FN-1204",
    inventoryId: "INV-0007",
    department: "行政處",
    unit: "財務室",
    site: "行政大樓",
    area: "4F 財務辦公區",
    attribute: "行政文書",
    groupName: "行政白班設備",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 08:15",
    shutdownAt: "2026-03-16 18:06",
    triggeredShutdownAt: "",
    notes: "下班後於正常時段關機。"
  },
  {
    id: "pc-008",
    hostname: "OPD-REG-013",
    assetTag: "AST-OP-3308",
    inventoryId: "INV-0008",
    department: "門診部",
    unit: "批價櫃檯",
    site: "總院",
    area: "門診大樓 1F",
    attribute: "公共服務",
    groupName: "門診服務群組",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 07:49",
    shutdownAt: "2026-03-16 20:42",
    triggeredShutdownAt: "",
    notes: "因延長服務時段，晚於一般下班時間但未進入夜間。"
  },
  {
    id: "pc-009",
    hostname: "ICU-CRT-005",
    assetTag: "AST-IC-8812",
    inventoryId: "INV-0009",
    department: "加護病房",
    unit: "ICU",
    site: "總院",
    area: "住院大樓 8F",
    attribute: "臨床照護",
    groupName: "ICU 特殊設備",
    managed: true,
    canShutdown: false,
    bootAt: "2026-03-16 00:00",
    shutdownAt: "",
    triggeredShutdownAt: "",
    notes: "病人監控相關設備，不可關機。"
  },
  {
    id: "pc-010",
    hostname: "PED-OA-002",
    assetTag: "AST-PD-2002",
    inventoryId: "INV-0010",
    department: "兒醫分院",
    unit: "行政窗口",
    site: "兒醫大樓",
    area: "1F 行政服務台",
    attribute: "行政文書",
    groupName: "兒醫行政群組",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 08:18",
    shutdownAt: "2026-03-16 18:44",
    triggeredShutdownAt: "",
    notes: "正常關機。"
  },
  {
    id: "pc-011",
    hostname: "PED-CLN-014",
    assetTag: "AST-PD-2144",
    inventoryId: "INV-0011",
    department: "兒醫分院",
    unit: "門診護理站",
    site: "兒醫大樓",
    area: "2F 兒科門診",
    attribute: "護理站",
    groupName: "兒醫護理群組",
    managed: true,
    canShutdown: true,
    bootAt: "2026-03-16 07:51",
    shutdownAt: "",
    triggeredShutdownAt: "",
    notes: "門診結束後未完成關機。"
  },
  {
    id: "pc-012",
    hostname: "MIS-ADM-001",
    assetTag: "AST-IT-9001",
    inventoryId: "INV-0012",
    department: "資訊室",
    unit: "資安監控",
    site: "行政大樓",
    area: "6F 機房旁監控室",
    attribute: "IT 管理",
    groupName: "IT 監控群組",
    managed: true,
    canShutdown: false,
    bootAt: "2026-03-16 00:00",
    shutdownAt: "",
    triggeredShutdownAt: "",
    notes: "資安監控工作站持續值勤。"
  }
];

export const trendRows = [
  {
    period: "2025-12",
    managedDevices: 82,
    normalShutdown: 38,
    overtimeShutdown: 12,
    unshutdown: 22,
    triggered: 10,
    shutdownRate: "61%"
  },
  {
    period: "2026-01",
    managedDevices: 82,
    normalShutdown: 42,
    overtimeShutdown: 15,
    unshutdown: 16,
    triggered: 9,
    shutdownRate: "70%"
  },
  {
    period: "2026-02",
    managedDevices: 83,
    normalShutdown: 47,
    overtimeShutdown: 17,
    unshutdown: 11,
    triggered: 8,
    shutdownRate: "77%"
  },
  {
    period: "2026-03",
    managedDevices: 84,
    normalShutdown: 51,
    overtimeShutdown: 18,
    unshutdown: 8,
    triggered: 7,
    shutdownRate: "82%"
  }
];
