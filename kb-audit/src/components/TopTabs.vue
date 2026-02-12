<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="border-b border-[var(--border-main)]">
    <div class="flex gap-2 px-6 pt-3">
      <button
        v-for="(tab, index) in tabs"
        :key="tab"
        class="rounded-t border border-b-0 px-4 py-2 text-[13px]"
        :class="
          index === 0
            ? 'border-[var(--border-main)] bg-white font-semibold text-[#666]'
            : 'border-transparent bg-[#f2f4f7] text-[#9098a6]'
        "
      >
        {{ tab }}
      </button>
    </div>
  </div>
</template>
