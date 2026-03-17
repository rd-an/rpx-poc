<script setup>
defineProps({
  cards: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    <article
      v-for="card in cards"
      :key="card.label"
      class="rounded border border-[var(--border-main)] bg-white p-4 shadow-[var(--shadow-soft)]"
    >
      <p class="text-[12px] font-semibold tracking-[0.08em] text-[#8291a2]">{{ card.label }}</p>
      <div class="mt-3 flex items-end justify-between gap-3">
        <p class="text-[28px] font-semibold text-[#3f4b58]">{{ card.value }}</p>
        <span class="rounded px-2 py-1 text-[12px] font-medium" :class="card.badgeClass">{{ card.badge }}</span>
      </div>
      <p class="mt-2 text-[12px] leading-5 text-[#6d7d8d]">{{ card.description }}</p>
    </article>
  </div>
</template>
