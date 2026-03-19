<script setup>
import { computed, ref, watch } from "vue";
import AppSidebar from "./components/AppSidebar.vue";
import FilterToolbar from "./components/FilterToolbar.vue";
import OverviewView from "./components/OverviewView.vue";
import ReportsView from "./components/ReportsView.vue";
import ScopeManagerView from "./components/ScopeManagerView.vue";
import TrendView from "./components/TrendView.vue";
import {
  defaultPolicy,
  defaultSavedScopes,
  deviceRecords,
  initialFilters,
  navItems,
  sidebarSections,
  trendRows
} from "./data/mockData";
import {
  buildDepartmentRows,
  buildReportSummary,
  buildSummaryCards,
  deriveDeviceStatus,
  getUniqueOptions,
  normalizeFilters,
  summarizeScopeCriteria
} from "./utils/reportUtils";

const STORAGE_KEYS = {
  filters: "shutmanage-filters",
  policy: "shutmanage-policy",
  scopes: "shutmanage-scopes"
};

const loadState = (key, fallback) => {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const sidebarOpen = ref(false);
const currentView = ref("overview");
const filters = ref(normalizeFilters(loadState(STORAGE_KEYS.filters, initialFilters)));
const policy = ref(loadState(STORAGE_KEYS.policy, defaultPolicy));
const savedScopes = ref(loadState(STORAGE_KEYS.scopes, defaultSavedScopes));
const scopeDraftName = ref("");
const scopeDraftDescription = ref("");

watch(
  filters,
  (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.filters, JSON.stringify(value));
    }
  },
  { deep: true }
);

watch(
  policy,
  (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.policy, JSON.stringify(value));
    }
  },
  { deep: true }
);

watch(
  savedScopes,
  (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEYS.scopes, JSON.stringify(value));
    }
  },
  { deep: true }
);

const options = computed(() => ({
  sites: getUniqueOptions(deviceRecords, "site"),
  departments: getUniqueOptions(deviceRecords, "department"),
  units: getUniqueOptions(deviceRecords, "unit"),
  areas: getUniqueOptions(deviceRecords, "area"),
  attributes: getUniqueOptions(deviceRecords, "attribute"),
  groupNames: getUniqueOptions(deviceRecords, "groupName")
}));

const activeScope = computed(() => {
  if (!filters.value.scopeId || filters.value.scopeId === "all") return null;
  return savedScopes.value.find((scope) => scope.id === filters.value.scopeId) ?? null;
});

const matchValue = (actual, expected) => !expected || actual === expected;

const matchesScope = (device, scope) => {
  if (!scope) return true;

  const { criteria } = scope;
  return (
    matchValue(device.site, criteria.site) &&
    matchValue(device.department, criteria.department) &&
    matchValue(device.unit, criteria.unit) &&
    matchValue(device.area, criteria.area) &&
    matchValue(device.attribute, criteria.attribute) &&
    matchValue(device.groupName, criteria.groupName) &&
    (criteria.canShutdown === null || criteria.canShutdown === undefined || device.canShutdown === criteria.canShutdown)
  );
};

const matchesPowerClass = (device, powerClass) => {
  if (!powerClass) return true;
  if (powerClass === "shutdown-only") return device.canShutdown;
  if (powerClass === "non-shutdown") return !device.canShutdown;
  return true;
};

const filteredDevices = computed(() =>
  deviceRecords.filter((device) => {
    if (!matchesScope(device, activeScope.value)) return false;
    if (!matchValue(device.site, filters.value.site)) return false;
    if (!matchValue(device.department, filters.value.department)) return false;
    if (!matchValue(device.unit, filters.value.unit)) return false;
    if (!matchValue(device.area, filters.value.area)) return false;
    if (!matchValue(device.attribute, filters.value.attribute)) return false;
    if (!matchValue(device.groupName, filters.value.groupName)) return false;
    if (!matchesPowerClass(device, filters.value.powerClass)) return false;

    const status = deriveDeviceStatus(device, policy.value);
    return !filters.value.status || status === filters.value.status;
  })
);

const summaryCards = computed(() => buildSummaryCards(filteredDevices.value, policy.value));
const reportSummary = computed(() => buildReportSummary(filteredDevices.value, policy.value));
const departmentRows = computed(() => buildDepartmentRows(filteredDevices.value, policy.value));
const focusRows = computed(() => filteredDevices.value.filter((device) => ["未關機", "已觸發關機"].includes(deriveDeviceStatus(device, policy.value))));

const scopePreviewRows = computed(() =>
  filteredDevices.value.map((device) => ({
    ...device,
    derivedStatus: deriveDeviceStatus(device, policy.value)
  }))
);

const currentScopeDescription = computed(() => summarizeScopeCriteria(activeScope.value?.criteria));
const isScopeManagerView = computed(() => currentView.value === "scope-manager");

const canSaveScope = computed(() => {
  if (!scopeDraftName.value.trim()) return false;

  const scopedFields = ["site", "department", "unit", "area", "attribute", "groupName", "powerClass"];
  return scopedFields.some((field) => filters.value[field]);
});

const setCurrentView = (view) => {
  currentView.value = view;
  sidebarOpen.value = false;
};

const updateFilter = ({ field, value }) => {
  filters.value = { ...filters.value, [field]: value };
};

const resetFilters = () => {
  filters.value = { ...initialFilters, auditDate: filters.value.auditDate };
};

const updatePolicy = ({ field, value }) => {
  policy.value = { ...policy.value, [field]: value };
};

const applyScope = (scopeId) => {
  filters.value = { ...filters.value, scopeId };
};

const buildScopeCriteriaFromFilters = () => ({
  site: filters.value.site || "",
  department: filters.value.department || "",
  unit: filters.value.unit || "",
  area: filters.value.area || "",
  attribute: filters.value.attribute || "",
  groupName: filters.value.groupName || "",
  canShutdown:
    filters.value.powerClass === "shutdown-only" ? true : filters.value.powerClass === "non-shutdown" ? false : null
});

const saveScope = () => {
  if (!canSaveScope.value) return;

  const scopeId = `scope-${Date.now()}`;
  savedScopes.value = [
    ...savedScopes.value,
    {
      id: scopeId,
      name: scopeDraftName.value.trim(),
      description: scopeDraftDescription.value.trim() || "由目前條件建立的自定義群組",
      criteria: buildScopeCriteriaFromFilters()
    }
  ];

  filters.value = { ...filters.value, scopeId };
  scopeDraftName.value = "";
  scopeDraftDescription.value = "";
};

const removeScope = (scopeId) => {
  savedScopes.value = savedScopes.value.filter((scope) => scope.id !== scopeId);
  if (filters.value.scopeId === scopeId) {
    filters.value = { ...filters.value, scopeId: "all" };
  }
};
</script>

<template>
  <div class="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)]">
    <AppSidebar
      v-if="!isScopeManagerView"
      :sections="sidebarSections"
      :nav-items="navItems"
      :sidebar-open="sidebarOpen"
      :current-view="currentView"
      @close="sidebarOpen = false"
      @select-view="setCurrentView"
    />

    <div :class="isScopeManagerView ? '' : 'md:ml-[248px]'">
      <main class="min-h-screen p-3 md:p-2">
        <section
          class="min-h-[calc(100vh-16px)] border border-[var(--border-main)] bg-[var(--surface)] shadow-[var(--shadow-soft)]"
          :class="isScopeManagerView ? 'scope-workspace-shell overflow-hidden' : ''"
        >
          <header v-if="!isScopeManagerView" class="flex items-center border-b border-[var(--border-main)] p-3 md:hidden">
            <button
              class="rounded border border-[var(--border-main)] bg-white px-3 py-1 text-[13px]"
              @click="sidebarOpen = true"
            >
              ☰ 選單
            </button>
          </header>

          <FilterToolbar
            v-if="!isScopeManagerView"
            :filters="filters"
            :saved-scopes="savedScopes"
            :options="options"
            :active-scope-description="currentScopeDescription"
            @update-filter="updateFilter"
            @reset-filters="resetFilters"
          />

          <OverviewView
            v-if="currentView === 'overview'"
            :summary-cards="summaryCards"
            :policy="policy"
            :department-rows="departmentRows"
            :focus-rows="focusRows"
            @update-policy="updatePolicy"
          />

          <ScopeManagerView
            v-else-if="currentView === 'scope-manager'"
            :saved-scopes="savedScopes"
            :filters="filters"
            :options="options"
            :active-scope-description="currentScopeDescription"
            :scope-draft-name="scopeDraftName"
            :scope-draft-description="scopeDraftDescription"
            :preview-rows="scopePreviewRows"
            :can-save-scope="canSaveScope"
            :nav-items="navItems"
            @update-draft-name="scopeDraftName = $event"
            @update-draft-description="scopeDraftDescription = $event"
            @update-filter="updateFilter"
            @reset-filters="resetFilters"
            @save-scope="saveScope"
            @apply-scope="applyScope"
            @remove-scope="removeScope"
            @select-view="setCurrentView"
          />

          <ReportsView
            v-else-if="currentView === 'reports'"
            :summary="reportSummary"
            :department-rows="departmentRows"
            :device-rows="scopePreviewRows"
            :filters="filters"
            :active-scope-name="activeScope?.name ?? '全部納管設備'"
            :policy="policy"
          />

          <TrendView
            v-else
            :trend-rows="trendRows"
            :summary="reportSummary"
          />
        </section>
      </main>
    </div>
  </div>
</template>
