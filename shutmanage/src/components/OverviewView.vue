<script setup>
import SummaryCards from "./SummaryCards.vue";

defineProps({
  summaryCards: {
    type: Array,
    required: true
  },
  policy: {
    type: Object,
    required: true
  },
  policySummary: {
    type: String,
    required: true
  },
  departmentRows: {
    type: Array,
    required: true
  },
  focusRows: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="space-y-4 px-6 py-4">
    <SummaryCards :cards="summaryCards" />

    <div class="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
      <section class="rounded border border-[var(--border-main)] bg-white">
        <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
          <h2 class="text-[14px] font-semibold text-[#4a5b6d]">政策判定基準</h2>
        </div>

        <div class="border-b border-[var(--border-soft)] bg-[#fbfcfe] px-4 py-3 text-[13px] text-[#5f7184]">
          {{ policySummary }}
        </div>

        <div class="grid gap-4 p-4 md:grid-cols-3">
          <div class="rounded border border-[var(--border-soft)] bg-[#fbfcfe] p-4">
            <p class="text-[12px] font-semibold text-[#6f8092]">正常關機</p>
            <p class="mt-2 text-[18px] font-semibold text-[#3f4b58]">{{ policy.normalShutdownStart }} - {{ policy.normalShutdownEnd }}</p>
            <p class="mt-2 text-[12px] leading-5 text-[#627385]">落在此區間的關機紀錄視為正常完成。</p>
          </div>

          <div class="rounded border border-[var(--border-soft)] bg-[#fbfcfe] p-4">
            <p class="text-[12px] font-semibold text-[#6f8092]">加班後關機</p>
            <p class="mt-2 text-[18px] font-semibold text-[#3f4b58]">{{ policy.overtimeShutdownStart }} - {{ policy.overtimeShutdownEnd }}</p>
            <p class="mt-2 text-[12px] leading-5 text-[#627385]">代表延後作業後完成關機，仍可視為合規。</p>
          </div>

          <div class="rounded border border-[var(--border-soft)] bg-[#fbfcfe] p-4">
            <p class="text-[12px] font-semibold text-[#6f8092]">未關機</p>
            <p class="mt-2 text-[18px] font-semibold text-[#3f4b58]">{{ policy.overtimeShutdownEnd }} 後</p>
            <p class="mt-2 text-[12px] leading-5 text-[#627385]">逾時才關機或完全沒有關機紀錄，都會歸到未關機。</p>
          </div>
        </div>

        <div class="grid gap-3 border-t border-[var(--border-soft)] bg-[#fbfcfe] px-4 py-4 text-[13px] text-[#617285] md:grid-cols-3">
          <div class="rounded border border-[var(--border-soft)] bg-white p-3">
            <p class="font-semibold text-[#405163]">正常關機判定</p>
            <p class="mt-2">可關機設備在 {{ policy.normalShutdownStart }} 至 {{ policy.normalShutdownEnd }} 之間關機。</p>
          </div>
          <div class="rounded border border-[var(--border-soft)] bg-white p-3">
            <p class="font-semibold text-[#405163]">加班後關機判定</p>
            <p class="mt-2">設備在 {{ policy.overtimeShutdownStart }} 至 {{ policy.overtimeShutdownEnd }} 之間關機。</p>
          </div>
          <div class="rounded border border-[var(--border-soft)] bg-white p-3">
            <p class="font-semibold text-[#405163]">未關機判定</p>
            <p class="mt-2">超過 {{ policy.overtimeShutdownEnd }} 才關機或沒有關機紀錄，且未被政策自動觸發。</p>
          </div>
        </div>

        <div class="border-t border-[var(--border-soft)] bg-white px-4 py-3 text-[12px] text-[#6f7f90]">
          規則編輯入口已集中到納管設定頁，避免總覽與設定頁出現兩套不同的判定來源。
        </div>
      </section>

      <section class="rounded border border-[var(--border-main)] bg-white">
        <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
          <h2 class="text-[14px] font-semibold text-[#4a5b6d]">需要優先追蹤的設備</h2>
        </div>

        <div class="p-4">
          <div v-if="focusRows.length" class="space-y-3">
            <article
              v-for="device in focusRows.slice(0, 4)"
              :key="device.hostname"
              class="rounded border border-[var(--border-soft)] bg-[#fbfcfe] p-3"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-[#3f4b58]">{{ device.hostname }}</p>
                  <p class="mt-1 text-[12px] text-[#718193]">{{ device.department }} / {{ device.unit }}</p>
                </div>
                <span
                  class="rounded px-2 py-1 text-[12px] font-semibold"
                  :class="device.derivedStatus === '未關機' ? 'bg-[#fff5df] text-[#9a6a00]' : 'bg-[#edf5ff] text-[#2f6aa7]'"
                >
                  {{ device.derivedStatus }}
                </span>
              </div>
              <p class="mt-2 text-[12px] leading-5 text-[#607082]">{{ device.notes }}</p>
            </article>
          </div>

          <div v-else class="rounded border border-dashed border-[var(--border-main)] px-4 py-6 text-center text-[13px] text-[#6f7f90]">
            目前篩選條件下沒有需要優先追蹤的設備。
          </div>
        </div>
      </section>
    </div>

    <section class="overflow-hidden rounded border border-[var(--border-main)] bg-white">
      <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
        <h2 class="text-[14px] font-semibold text-[#4a5b6d]">部門彙總檢視</h2>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="table-head-cell">部門</th>
              <th class="table-head-cell">設備總數</th>
              <th class="table-head-cell">納管設備</th>
              <th class="table-head-cell">不可關機</th>
              <th class="table-head-cell">群組排除</th>
              <th class="table-head-cell">正常關機</th>
              <th class="table-head-cell">加班後關機</th>
              <th class="table-head-cell">未關機</th>
              <th class="table-head-cell">已觸發關機</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in departmentRows" :key="row.department" class="h-11 hover:bg-[#f8fbff]">
              <td class="table-body-cell font-medium">{{ row.department }}</td>
              <td class="table-body-cell">{{ row.total }}</td>
              <td class="table-body-cell">{{ row.managed }}</td>
              <td class="table-body-cell">{{ row.cannotShutdown }}</td>
              <td class="table-body-cell">{{ row.excludedByGroup }}</td>
              <td class="table-body-cell">{{ row.normalShutdown }}</td>
              <td class="table-body-cell">{{ row.overtimeShutdown }}</td>
              <td class="table-body-cell">{{ row.unshutdown }}</td>
              <td class="table-body-cell">{{ row.triggered }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
