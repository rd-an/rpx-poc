<script setup>
defineProps({
  rows: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="px-6 pb-3">
    <div class="overflow-hidden border border-[var(--border-main)] bg-white">
      <table class="w-full border-collapse text-left text-[13px]">
        <thead class="bg-[var(--table-head)] text-[#6d7784]">
          <tr>
            <th class="w-14 border-b border-r border-[var(--border-main)] px-3 py-2 font-semibold">項次</th>
            <th class="border-b border-r border-[var(--border-main)] px-3 py-2 font-semibold">軟體</th>
            <th class="w-[220px] border-b border-r border-[var(--border-main)] px-3 py-2 font-semibold">版本</th>
            <th class="w-[190px] border-b border-[var(--border-main)] px-3 py-2 font-semibold">已安裝電腦數</th>
          </tr>
        </thead>
        <tbody class="text-[#4f5b67]">
          <tr v-for="(row, index) in rows" :key="`${row[0]}-${row[1]}-${index}`" class="h-11">
            <td class="border-b border-r border-[var(--border-soft)] px-3">{{ index + 1 }}</td>
            <td class="border-b border-r border-[var(--border-soft)] px-3">{{ row[0] }}</td>
            <td class="border-b border-r border-[var(--border-soft)] px-3">{{ row[1] }}</td>
            <td class="border-b border-[var(--border-soft)] px-3">
              <span
                class="inline-flex min-w-8 items-center justify-center rounded border border-[var(--border-main)] bg-[#fff] px-2 py-0.5 text-[12px]"
              >
                💻 {{ row[2] }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
