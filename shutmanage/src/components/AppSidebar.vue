<script setup>
defineProps({
  sections: {
    type: Array,
    required: true
  },
  navItems: {
    type: Array,
    required: true
  },
  sidebarOpen: {
    type: Boolean,
    required: true
  },
  currentView: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["close", "select-view"]);
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-transform duration-200 md:translate-x-0"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <header class="flex items-center gap-2 border-b border-[var(--border-soft)] p-3">
      <button class="rounded bg-[var(--btn-muted)] px-3 py-1 text-[12px] text-white">儲存條件</button>
      <button class="rounded bg-[var(--btn-muted)] px-3 py-1 text-[12px] text-white">報表範本</button>
      <button class="ml-auto text-lg md:hidden" @click="emit('close')">×</button>
    </header>

    <nav class="h-[calc(100%-49px)] overflow-y-auto">
      <ul class="pt-2">
        <li
          v-for="section in sections"
          :key="section.title"
          class="flex h-11 items-center gap-3 px-4 text-[14px]"
          :class="section.active ? 'bg-[#5d5d5d] text-white' : 'text-[#d5d5d5] hover:bg-[#4b4b4b]'"
        >
          <span class="w-4 text-center text-[13px]">{{ section.icon }}</span>
          <span class="font-medium">{{ section.title }}</span>
        </li>
      </ul>

      <section class="mt-2 border-y border-[var(--border-soft)] py-2">
        <div class="px-4 pb-2 text-[12px] font-semibold tracking-[0.08em] text-[#aeb8c5]">關機管理 POC</div>
        <ul class="bg-[#454545] py-1">
          <li v-for="item in navItems" :key="item.view" class="h-10 text-[13px]">
            <button
              class="flex h-full w-full items-center gap-3 pl-6 pr-4 text-left"
              :class="
                currentView === item.view
                  ? 'bg-[#3f3f3f] font-semibold text-white'
                  : 'text-[#d5d5d5] hover:bg-[#3f3f3f]'
              "
              @click="emit('select-view', item.view)"
            >
              <span class="w-4 text-center text-[12px]">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>

      <div class="px-4 py-4 text-[12px] leading-6 text-[#b9c0c8]">
        <p class="font-semibold text-white">院內節能管理</p>
        <p class="mt-2">提供納管設定、開關機資料蒐集、稽核報表與正式檔案匯出。</p>
      </div>
    </nav>
  </aside>
</template>
