<script setup>
import { computed, ref } from "vue";
import ActionBar from "./components/ActionBar.vue";
import AppSidebar from "./components/AppSidebar.vue";
import InstallStatsTable from "./components/InstallStatsTable.vue";
import KbAuditView from "./components/KbAuditView.vue";
import PaginationBar from "./components/PaginationBar.vue";
import TopTabs from "./components/TopTabs.vue";
import { installStatsRows, kbAuditOsGroups, sidebarSections, softwareMenu, tabs, weaknessMenu } from "./data/mockData";

const sidebarOpen = ref(false);
const total = computed(() => 1267);
const currentView = ref("install-stats");

const onSelectView = (view) => {
  currentView.value = view;
  sidebarOpen.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-[var(--page-bg)] text-[var(--text-main)]">
    <AppSidebar
      :sections="sidebarSections"
      :software-menu="softwareMenu"
      :weakness-menu="weaknessMenu"
      :sidebar-open="sidebarOpen"
      :current-view="currentView"
      @close="sidebarOpen = false"
      @select-view="onSelectView"
    />

    <div class="md:ml-[248px]">
      <main class="min-h-screen p-3 md:p-2">
        <section class="min-h-[calc(100vh-16px)] border border-[var(--border-main)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
          <header class="flex items-center border-b border-[var(--border-main)] p-3 md:hidden">
            <button
              class="rounded border border-[var(--border-main)] bg-white px-3 py-1 text-[13px]"
              @click="sidebarOpen = true"
            >
              ☰ 選單
            </button>
          </header>

          <template v-if="currentView === 'install-stats'">
            <TopTabs :tabs="tabs" />
            <ActionBar />
            <InstallStatsTable :rows="installStatsRows" />
            <PaginationBar :total="total" />
          </template>
          <KbAuditView v-else-if="currentView === 'kb-audit'" :os-groups="kbAuditOsGroups" />
        </section>
      </main>
    </div>
  </div>
</template>
