<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  savedScopes: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    required: true
  },
  activeScopeDescription: {
    type: String,
    required: true
  },
  policy: {
    type: Object,
    required: true
  },
  policyValidation: {
    type: Object,
    required: true
  },
  policySummary: {
    type: String,
    required: true
  },
  scopeDraftName: {
    type: String,
    required: true
  },
  scopeDraftDescription: {
    type: String,
    required: true
  },
  scopeDraftExcludeFromShutdownPolicy: {
    type: Boolean,
    required: true
  },
  previewRows: {
    type: Array,
    required: true
  },
  canSaveScope: {
    type: Boolean,
    required: true
  },
  navItems: {
    type: Array,
    required: true
  }
});

const emit = defineEmits([
  "update-draft-name",
  "update-draft-description",
  "update-draft-exclude-from-shutdown-policy",
  "update-filter",
  "reset-filters",
  "save-scope",
  "apply-scope",
  "remove-scope",
  "update-policy",
  "reset-policy",
  "select-view"
]);

const scopeKeyword = ref("");
const tableKeyword = ref("");
const page = ref(1);
const pageSize = ref(20);
const collapsedGroups = ref(new Set());
const showScopeComposer = ref(false);

const updateField = (field, event) => {
  emit("update-filter", { field, value: event.target.value });
};

const scopeSearchMatch = (scope) => {
  const keyword = scopeKeyword.value.trim().toLowerCase();
  if (!keyword) return true;

  const criteriaText = Object.entries(scope.criteria || {})
    .filter(([, value]) => value !== "" && value !== null)
    .map(([key, value]) => `${key}:${value}`)
    .join(" ")
    .toLowerCase();

  return [scope.name, scope.description, criteriaText].join(" ").toLowerCase().includes(keyword);
};

const groupedScopes = computed(() => {
  const allScope = props.savedScopes.find((scope) => scope.id === "all");
  const customScopes = props.savedScopes.filter((scope) => scope.id !== "all");

  return [
    {
      id: "system",
      label: "系統預設",
      children: allScope ? [allScope] : []
    },
    {
      id: "custom",
      label: "自定義群組",
      children: customScopes
    }
  ].filter((group) => group.children.some(scopeSearchMatch));
});

const toggleGroup = (groupId) => {
  const next = new Set(collapsedGroups.value);
  if (next.has(groupId)) {
    next.delete(groupId);
  } else {
    next.add(groupId);
  }
  collapsedGroups.value = next;
};

const filteredRows = computed(() => {
  const keyword = tableKeyword.value.trim().toLowerCase();
  if (!keyword) return props.previewRows;

  return props.previewRows.filter((row) =>
    [row.hostname, row.assetTag, row.inventoryId, row.department, row.unit, row.groupName]
      .join(" ")
      .toLowerCase()
      .includes(keyword)
  );
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)));
const currentPage = computed(() => Math.min(page.value, totalPages.value));

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const rangeText = computed(() => {
  const start = filteredRows.value.length ? (currentPage.value - 1) * pageSize.value + 1 : 0;
  const end = Math.min(currentPage.value * pageSize.value, filteredRows.value.length);
  return `${start}-${end} / ${filteredRows.value.length}`;
});

const policyValidationMessages = computed(() => Object.values(props.policyValidation.errors));

const policyPreviewCards = computed(() => {
  const counts = props.previewRows.reduce(
    (result, row) => {
      result[row.derivedStatus] = (result[row.derivedStatus] || 0) + 1;
      return result;
    },
    {
      正常關機: 0,
      加班後關機: 0,
      群組排除: 0,
      未關機: 0,
      已觸發關機: 0
    }
  );

  return [
    { key: "正常關機", label: "正常關機", value: counts.正常關機, tone: "scope-policy-preview-card-green" },
    { key: "加班後關機", label: "加班後關機", value: counts.加班後關機, tone: "scope-policy-preview-card-blue" },
    { key: "群組排除", label: "群組排除", value: counts.群組排除, tone: "scope-policy-preview-card-slate" },
    { key: "未關機", label: "未關機", value: counts.未關機, tone: "scope-policy-preview-card-amber" },
    { key: "已觸發關機", label: "已觸發關機", value: counts.已觸發關機, tone: "scope-policy-preview-card-pink" }
  ];
});

const goPrev = () => {
  page.value = Math.max(1, page.value - 1);
};

const goNext = () => {
  page.value = Math.min(totalPages.value, page.value + 1);
};

const updatePolicyField = (field, event) => {
  emit("update-policy", { field, value: event.target.value });
};

const updateScopeExcludeFlag = (event) => {
  emit("update-draft-exclude-from-shutdown-policy", event.target.checked);
};

const openScopeComposer = () => {
  showScopeComposer.value = true;
};

const closeScopeComposer = () => {
  showScopeComposer.value = false;
};

const saveScopeDraft = () => {
  if (!props.canSaveScope) return;
  emit("save-scope");
  closeScopeComposer();
};

const statusDotClass = (status) => {
  if (status === "正常關機") return "scope-dot scope-dot-green";
  if (status === "加班後關機") return "scope-dot scope-dot-blue";
  if (status === "群組排除") return "scope-dot scope-dot-slate";
  if (status === "未關機") return "scope-dot scope-dot-amber";
  if (status === "已觸發關機") return "scope-dot scope-dot-pink";
  return "scope-dot scope-dot-gray";
};

const parseDateTime = (value) => {
  if (!value) return null;
  const parsed = new Date(value.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatUptime = (device) => {
  const start = parseDateTime(device.bootAt);
  const end = parseDateTime(device.shutdownAt || device.triggeredShutdownAt);
  if (!start) return "-";
  if (!end) return "持續開機";

  const durationMs = Math.max(0, end.getTime() - start.getTime());
  const totalMinutes = Math.floor(durationMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} 小時 ${minutes} 分`;
};
</script>

<template>
  <div class="scope-workspace">
    <aside class="scope-tree-panel">
      <header class="scope-tree-header">
        <div class="scope-tree-title">自訂群組</div>
        <div class="scope-tree-actions">
          <button class="scope-mini-icon" type="button" title="重整">⟳</button>
          <button class="scope-mini-icon" type="button" title="清單">◫</button>
        </div>
      </header>

      <div class="scope-tree-filters">
        <label class="toolbar-field">
          <span>設備類型</span>
          <select :value="filters.attribute" @change="updateField('attribute', $event)">
            <option value="">全部</option>
            <option v-for="attribute in options.attributes" :key="attribute" :value="attribute">{{ attribute }}</option>
          </select>
        </label>

        <label class="toolbar-field">
          <span>系統版本</span>
          <select :value="filters.site" @change="updateField('site', $event)">
            <option value="">全部院區</option>
            <option v-for="site in options.sites" :key="site" :value="site">{{ site }}</option>
          </select>
        </label>

        <label class="scope-search-box">
          <input v-model="scopeKeyword" type="text" placeholder="單位過濾..." />
          <span>⌕</span>
        </label>
      </div>

      <div class="scope-tree-list">
        <section v-for="group in groupedScopes" :key="group.id" class="scope-tree-group">
          <button class="scope-tree-group-label" type="button" @click="toggleGroup(group.id)">
            <span>{{ collapsedGroups.has(group.id) ? "▸" : "▾" }}</span>
            <span>{{ group.label }}</span>
          </button>

          <ul v-if="!collapsedGroups.has(group.id)">
            <li v-for="scope in group.children.filter(scopeSearchMatch)" :key="scope.id">
              <button
                class="scope-tree-node"
                :class="filters.scopeId === scope.id ? 'scope-tree-node-active' : ''"
                type="button"
                @click="emit('apply-scope', scope.id)"
              >
                <span class="scope-tree-node-text">{{ scope.name }}</span>
                <div class="scope-tree-node-tags">
                  <span v-if="scope.excludeFromShutdownPolicy" class="scope-chip scope-chip-muted">免關機</span>
                  <span v-if="scope.id === 'all'" class="scope-chip">預設</span>
                </div>
              </button>
            </li>
          </ul>
        </section>
      </div>

      <div class="scope-tree-footer">
        <button class="scope-primary-btn" type="button" @click="openScopeComposer">
          ＋ 新增群組
        </button>
      </div>
    </aside>

    <section class="scope-main-panel">
      <header class="scope-main-tabs">
        <button
          v-for="item in navItems"
          :key="item.view"
          class="scope-tab"
          :class="item.view === 'scope-manager' ? 'scope-tab-active' : ''"
          type="button"
          @click="emit('select-view', item.view)"
        >
          {{ item.label }}
        </button>
      </header>

      <div class="scope-main-toolbar">
        <div class="scope-toolbar-left">
          <button class="scope-action-btn" type="button" @click="emit('reset-filters')">⟳ 重整</button>
          <label class="scope-action-search">
            <span>⌕</span>
            <input v-model="tableKeyword" type="text" placeholder="搜尋電腦名稱、資產編號..." />
          </label>
        </div>

        <div class="scope-toolbar-right">
          <label class="scope-compact-select">
            <span>群組</span>
            <select :value="filters.scopeId" @change="updateField('scopeId', $event)">
              <option v-for="scope in savedScopes" :key="scope.id" :value="scope.id">{{ scope.name }}</option>
            </select>
          </label>

          <label class="scope-compact-select">
            <span>部門名稱</span>
            <select :value="filters.department" @change="updateField('department', $event)">
              <option value="">全部</option>
              <option v-for="department in options.departments" :key="department" :value="department">{{ department }}</option>
            </select>
          </label>

          <button class="scope-deploy-btn" type="button" :disabled="!policyValidation.isValid" title="規則有效後才能部署">
            部署
          </button>
        </div>
      </div>

      <section class="scope-policy-panel">
        <div class="scope-policy-header">
          <div>
            <h3>關機狀態規則</h3>
            <p>全域共用規則，調整後會立即重算目前清單、總覽與報表結果。</p>
          </div>

          <button class="scope-secondary-btn" type="button" @click="emit('reset-policy')">還原預設</button>
        </div>

        <div class="scope-policy-grid">
          <label class="toolbar-field">
            <span>正常關機開始</span>
            <input :value="policy.normalShutdownStart" type="time" @input="updatePolicyField('normalShutdownStart', $event)" />
          </label>

          <label class="toolbar-field">
            <span>正常關機結束</span>
            <input :value="policy.normalShutdownEnd" type="time" @input="updatePolicyField('normalShutdownEnd', $event)" />
          </label>

          <label class="toolbar-field">
            <span>加班關機開始</span>
            <input :value="policy.overtimeShutdownStart" type="time" @input="updatePolicyField('overtimeShutdownStart', $event)" />
          </label>

          <label class="toolbar-field">
            <span>加班關機截止</span>
            <input :value="policy.overtimeShutdownEnd" type="time" @input="updatePolicyField('overtimeShutdownEnd', $event)" />
          </label>

          <div class="scope-policy-cutoff">
            <strong>未關機判定</strong>
            <p>{{ policy.overtimeShutdownEnd }} 後關機，或完全沒有關機紀錄。</p>
          </div>
        </div>

        <div class="scope-policy-summary">
          <strong>目前規則：</strong>
          <span>{{ policySummary }}</span>
        </div>

        <div v-if="policyValidationMessages.length" class="scope-policy-errors">
          <p v-for="message in policyValidationMessages" :key="message">{{ message }}</p>
        </div>

        <div class="scope-policy-preview">
          <article v-for="item in policyPreviewCards" :key="item.key" class="scope-policy-preview-card" :class="item.tone">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </section>

      <div class="scope-active-criteria">
        <strong>作用中群組條件：</strong>
        <span>{{ activeScopeDescription }}</span>
      </div>

      <div class="scope-table-wrap">
        <div class="scope-table-scroll">
          <table class="w-full min-w-[1120px] text-left text-[13px] text-[#4f5b67]">
            <thead class="bg-[#f8fafc] text-[#6e7d8d]">
              <tr>
                <th class="table-head-cell">項次</th>
                <th class="table-head-cell">編號</th>
                <th class="table-head-cell">電腦名稱</th>
                <th class="table-head-cell">狀態</th>
                <th class="table-head-cell">群組路徑</th>
                <th class="table-head-cell">使用者帳號</th>
                <th class="table-head-cell">開機時間</th>
                <th class="table-head-cell">關機時間</th>
                <th class="table-head-cell">開機時長</th>
                <th class="table-head-cell">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(device, index) in pagedRows" :key="device.id" class="h-11 hover:bg-[#f8fbff]">
                <td class="table-body-cell">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td class="table-body-cell">{{ device.inventoryId }}</td>
                <td class="table-body-cell font-medium">{{ device.hostname }}</td>
                <td class="table-body-cell">
                  <div class="scope-status-cell">
                    <span :class="statusDotClass(device.derivedStatus)"></span>
                    <span class="scope-status-text">{{ device.derivedStatus }}</span>
                  </div>
                </td>
                <td class="table-body-cell">{{ device.department }} / {{ device.unit }}</td>
                <td class="table-body-cell">{{ device.assetTag }}</td>
                <td class="table-body-cell">{{ device.bootAt || "-" }}</td>
                <td class="table-body-cell">{{ device.shutdownAt || device.triggeredShutdownAt || "-" }}</td>
                <td class="table-body-cell">{{ formatUptime(device) }}</td>
                <td class="table-body-cell">
                  <div class="scope-row-actions">
                    <button type="button">檢視</button>
                    <button type="button">⋮</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="scope-pagination">
          <span>共 {{ filteredRows.length }} 筆</span>

          <div class="scope-pagination-controls">
            <button type="button" @click="goPrev">‹</button>
            <span>{{ currentPage }}</span>
            <button type="button" @click="goNext">›</button>
          </div>

          <label>
            <span>每頁</span>
            <select v-model.number="pageSize">
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
          </label>

          <span>{{ rangeText }}</span>
        </footer>
      </div>

      <div v-if="showScopeComposer" class="scope-composer-backdrop" @click.self="closeScopeComposer">
        <section class="scope-composer-card">
          <div class="scope-composer-header">
            <div>
              <h3>新增納管群組</h3>
              <p>使用目前篩選條件建立群組，並可指定是否排除在關機政策之外。</p>
            </div>

            <button class="scope-composer-close" type="button" @click="closeScopeComposer">✕</button>
          </div>

          <div class="scope-composer-grid">
            <label class="toolbar-field">
              <span>群組名稱</span>
              <input
                :value="scopeDraftName"
                type="text"
                placeholder="例如：行政白班設備"
                @input="emit('update-draft-name', $event.target.value)"
              />
            </label>

            <label class="toolbar-field">
              <span>用途說明</span>
              <input
                :value="scopeDraftDescription"
                type="text"
                placeholder="例如：不列入下班關機稽核的醫療特殊設備"
                @input="emit('update-draft-description', $event.target.value)"
              />
            </label>
          </div>

          <div class="scope-composer-summary">
            <strong>目前條件</strong>
            <p>{{ activeScopeDescription }}</p>
          </div>

          <label class="scope-flag-toggle">
            <input :checked="scopeDraftExcludeFromShutdownPolicy" type="checkbox" @change="updateScopeExcludeFlag" />
            <div>
              <strong>此群組不套用關機政策</strong>
              <p>群組內設備仍屬納管，但會自正常關機、加班關機、未關機 KPI 中排除。</p>
            </div>
          </label>

          <div class="scope-composer-actions">
            <button class="scope-secondary-btn" type="button" @click="closeScopeComposer">取消</button>
            <button class="scope-primary-btn scope-primary-btn-inline" type="button" :disabled="!canSaveScope" @click="saveScopeDraft">
              建立群組
            </button>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>
