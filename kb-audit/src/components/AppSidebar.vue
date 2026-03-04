<script setup>
import { ref } from "vue";

const props = defineProps({
  sections: {
    type: Array,
    required: true
  },
  softwareMenu: {
    type: Array,
    required: true
  },
  weaknessMenu: {
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
const softwareExpanded = ref(false);
const weaknessExpanded = ref(true);

const selectView = (view) => {
  if (!view) return;
  emit("select-view", view);
};

const toggleSoftware = () => {
  const next = !softwareExpanded.value;
  softwareExpanded.value = next;
  if (next) weaknessExpanded.value = false;
};

const toggleWeakness = () => {
  const next = !weaknessExpanded.value;
  weaknessExpanded.value = next;
  if (next) softwareExpanded.value = false;
};
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 w-[248px] border-r border-[var(--border-soft)] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] transition-transform duration-200 md:translate-x-0"
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <header class="flex items-center gap-2 border-b border-[var(--border-soft)] p-3">
      <button class="rounded bg-[var(--btn-muted)] px-3 py-1 text-[12px] text-white">加到最愛</button>
      <button class="rounded bg-[var(--btn-muted)] px-3 py-1 text-[12px] text-white">編輯最愛</button>
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
        <button
          class="flex h-11 w-full items-center justify-between px-4 text-left text-[14px] hover:bg-[#4b4b4b]"
          :class="softwareExpanded ? 'text-white' : 'text-[#b9c0c8]'"
          @click="toggleSoftware"
        >
          <span>軟體</span>
          <span class="text-[11px]" :class="softwareExpanded ? 'text-white' : 'text-[#8f99a6]'">
            {{ softwareExpanded ? "▾" : "▸" }}
          </span>
        </button>
        <ul v-show="softwareExpanded" class="bg-[#454545] py-1">
          <li
            v-for="item in softwareMenu"
            :key="item.label"
            class="h-9 text-[13px]"
          >
            <button
              class="flex h-full w-full items-center gap-3 pl-11 pr-4 text-left"
              :class="
                props.currentView === item.view
                  ? 'bg-[#3f3f3f] font-semibold text-white'
                  : 'text-[#d5d5d5] hover:bg-[#3f3f3f]'
              "
              @click="selectView(item.view)"
            >
              <span class="w-4 text-center text-[12px]">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          </li>
        </ul>
      </section>

      <ul class="pt-2">
        <li>
          <button
            class="flex h-11 w-full items-center justify-between px-4 text-[14px] hover:bg-[#4b4b4b]"
            :class="weaknessExpanded ? 'text-white' : 'text-[#b9c0c8]'"
            @click="toggleWeakness"
          >
            <span class="flex items-center gap-3">
              <span class="w-4 text-center">🔧</span>
              <span>弱點</span>
            </span>
            <span class="text-[11px]" :class="weaknessExpanded ? 'text-white' : 'text-[#8f99a6]'">
              {{ weaknessExpanded ? "▾" : "▸" }}
            </span>
          </button>
          <ul v-show="weaknessExpanded" class="bg-[#454545] py-1">
            <li
              v-for="item in weaknessMenu"
              :key="item.label"
              class="h-9 text-[13px]"
            >
              <button
                class="flex h-full w-full items-center gap-3 pl-11 pr-4 text-left text-[#d5d5d5] hover:bg-[#3f3f3f]"
                :class="props.currentView === item.view ? 'bg-[#3f3f3f] text-white' : ''"
                @click="selectView(item.view)"
              >
                <span class="w-4 text-center text-[12px]">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </button>
            </li>
          </ul>
        </li>
        <li class="flex h-11 items-center gap-3 px-4 text-[14px] text-[#d5d5d5] hover:bg-[#4b4b4b]">
          <span class="w-4 text-center">◈</span>
          <span>系統</span>
        </li>
      </ul>
    </nav>
  </aside>
</template>
