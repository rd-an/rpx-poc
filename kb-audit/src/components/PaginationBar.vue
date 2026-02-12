<script setup>
defineProps({
  total: {
    type: Number,
    required: true
  }
});
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-3 px-6 pb-6 pt-2 text-[13px] text-[#6d7784]">
    <span>共 {{ total }} 條</span>
    <button class="text-[#9aa5b1]">&lt;</button>
    <button class="h-7 w-7 rounded border border-[var(--border-main)] bg-white text-[#4f5b67]">1</button>
    <button class="h-7 w-7 rounded border border-[var(--border-main)] bg-white text-[#4f5b67]">2</button>
    <span>...</span>
    <button class="h-7 w-7 rounded border border-[var(--border-main)] bg-white text-[#4f5b67]">64</button>
    <button class="text-[#9aa5b1]">&gt;</button>
    <span>20 筆/頁</span>
    <span>跳至</span>
    <input
      type="text"
      value="1"
      class="h-7 w-10 rounded border border-[var(--border-main)] bg-white px-2 text-center text-[#4f5b67] outline-none"
    />
    <span>頁</span>
  </div>
</template>
