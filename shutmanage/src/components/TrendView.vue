<script setup>
defineProps({
  trendRows: {
    type: Array,
    required: true
  },
  summary: {
    type: Object,
    required: true
  }
});
</script>

<template>
  <div class="space-y-4 px-6 py-4">
    <section class="rounded border border-[var(--border-main)] bg-white p-4">
      <h2 class="text-[18px] font-semibold text-[#3f4b58]">長期趨勢分析</h2>
      <p class="mt-2 text-[13px] leading-6 text-[#667384]">
        用於觀察政策宣導後的關機率改善情形，同時追蹤未關機與自動觸發關機的月度變化。
      </p>

      <div class="mt-4 grid gap-3 md:grid-cols-4">
        <div class="report-kpi">
          <span>目前關機達成率</span>
          <strong>{{ summary.shutdownRate }}</strong>
        </div>
        <div class="report-kpi">
          <span>目前群組排除數</span>
          <strong>{{ summary.excludedByGroup }}</strong>
        </div>
        <div class="report-kpi">
          <span>目前未關機數</span>
          <strong>{{ summary.unshutdown }}</strong>
        </div>
        <div class="report-kpi">
          <span>目前觸發關機數</span>
          <strong>{{ summary.triggered }}</strong>
        </div>
      </div>
    </section>

    <section class="rounded border border-[var(--border-main)] bg-white">
      <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
        <h2 class="text-[14px] font-semibold text-[#4a5b6d]">月度關機率趨勢</h2>
      </div>

      <div class="space-y-4 p-4">
        <article
          v-for="row in trendRows"
          :key="row.period"
          class="rounded border border-[var(--border-soft)] bg-[#fbfcfe] p-4"
        >
          <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p class="font-semibold text-[#3f4b58]">{{ row.period }}</p>
              <p class="mt-1 text-[12px] text-[#6b7b8c]">
                正常關機 {{ row.normalShutdown }} ｜ 加班後關機 {{ row.overtimeShutdown }} ｜ 未關機 {{ row.unshutdown }}
              </p>
            </div>

            <div class="w-full max-w-[420px]">
              <div class="h-3 overflow-hidden rounded-full bg-[#e8edf3]">
                <div class="h-full rounded-full bg-[#4ab7db]" :style="{ width: row.shutdownRate }"></div>
              </div>
              <div class="mt-2 flex items-center justify-between text-[12px] text-[#607082]">
                <span>達成率</span>
                <span class="font-semibold">{{ row.shutdownRate }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="overflow-hidden rounded border border-[var(--border-main)] bg-white">
      <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
        <h2 class="text-[14px] font-semibold text-[#4a5b6d]">趨勢明細表</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="table-head-cell">月份</th>
              <th class="table-head-cell">納管設備</th>
              <th class="table-head-cell">正常關機</th>
              <th class="table-head-cell">加班後關機</th>
              <th class="table-head-cell">未關機</th>
              <th class="table-head-cell">觸發關機</th>
              <th class="table-head-cell">關機率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in trendRows" :key="`table-${row.period}`" class="h-11 hover:bg-[#f8fbff]">
              <td class="table-body-cell font-medium">{{ row.period }}</td>
              <td class="table-body-cell">{{ row.managedDevices }}</td>
              <td class="table-body-cell">{{ row.normalShutdown }}</td>
              <td class="table-body-cell">{{ row.overtimeShutdown }}</td>
              <td class="table-body-cell">{{ row.unshutdown }}</td>
              <td class="table-body-cell">{{ row.triggered }}</td>
              <td class="table-body-cell">{{ row.shutdownRate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
