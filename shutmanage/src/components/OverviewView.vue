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
  departmentRows: {
    type: Array,
    required: true
  },
  focusRows: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["update-policy"]);

const updatePolicyField = (field, event) => {
  emit("update-policy", { field, value: event.target.value });
};
</script>

<template>
  <div class="space-y-4 px-6 py-4">
    <SummaryCards :cards="summaryCards" />

    <div class="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
      <section class="rounded border border-[var(--border-main)] bg-white">
        <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
          <h2 class="text-[14px] font-semibold text-[#4a5b6d]">政策判定基準</h2>
        </div>

        <div class="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          <label class="toolbar-field">
            <span>正常上班時間</span>
            <input :value="policy.workStart" type="time" @input="updatePolicyField('workStart', $event)" />
          </label>

          <label class="toolbar-field">
            <span>下班時間</span>
            <input :value="policy.workEnd" type="time" @input="updatePolicyField('workEnd', $event)" />
          </label>

          <label class="toolbar-field">
            <span>夜間起始</span>
            <input :value="policy.nightStart" type="time" @input="updatePolicyField('nightStart', $event)" />
          </label>

          <label class="toolbar-field">
            <span>夜間截止</span>
            <input :value="policy.nightEnd" type="time" @input="updatePolicyField('nightEnd', $event)" />
          </label>
        </div>

        <div class="grid gap-3 border-t border-[var(--border-soft)] bg-[#fbfcfe] px-4 py-4 text-[13px] text-[#617285] md:grid-cols-3">
          <div class="rounded border border-[var(--border-soft)] bg-white p-3">
            <p class="font-semibold text-[#405163]">正常關機判定</p>
            <p class="mt-2">可關機設備於 {{ policy.workEnd }} 至 {{ policy.nightStart }} 前完成關機。</p>
          </div>
          <div class="rounded border border-[var(--border-soft)] bg-white p-3">
            <p class="font-semibold text-[#405163]">加班後關機判定</p>
            <p class="mt-2">設備於夜間區間 {{ policy.nightStart }} ~ {{ policy.nightEnd }} 關機。</p>
          </div>
          <div class="rounded border border-[var(--border-soft)] bg-white p-3">
            <p class="font-semibold text-[#405163]">未關機判定</p>
            <p class="mt-2">可關機且已納管設備無關機紀錄，且未觸發政策關機。</p>
          </div>
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
