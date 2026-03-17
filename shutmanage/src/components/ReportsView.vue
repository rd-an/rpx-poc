<script setup>
import { ref } from "vue";
import { exportAuditCsv, exportAuditExcel, exportAuditPdf } from "../utils/reportUtils";

const props = defineProps({
  summary: {
    type: Object,
    required: true
  },
  departmentRows: {
    type: Array,
    required: true
  },
  deviceRows: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  },
  activeScopeName: {
    type: String,
    required: true
  },
  policy: {
    type: Object,
    required: true
  }
});

const reportRef = ref(null);
const exportingPdf = ref(false);

const reportMeta = () => ({
  auditDate: props.filters.auditDate,
  scopeName: props.activeScopeName,
  policy: props.policy
});

const handlePdfExport = async () => {
  if (!reportRef.value || exportingPdf.value) return;

  exportingPdf.value = true;

  try {
    await exportAuditPdf(reportRef.value, reportMeta());
  } finally {
    exportingPdf.value = false;
  }
};
</script>

<template>
  <div class="space-y-4 px-6 py-4">
    <header class="flex flex-col items-start justify-between gap-4 rounded border border-[var(--border-main)] bg-white p-4 xl:flex-row xl:items-center">
      <div>
        <h2 class="text-[18px] font-semibold text-[#3f4b58]">稽核報表</h2>
        <p class="mt-1 text-[13px] leading-6 text-[#667384]">
          提供整體彙總、部門明細與設備明細，並支援 CSV、Excel、PDF 正式檔案輸出。
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          class="h-8 rounded bg-[var(--btn-blue)] px-4 text-[12px] font-semibold text-white"
          @click="exportAuditCsv(deviceRows, reportMeta())"
        >
          匯出 CSV
        </button>
        <button
          class="h-8 rounded bg-[var(--btn-green)] px-4 text-[12px] font-semibold text-white"
          @click="exportAuditExcel(summary, departmentRows, deviceRows, reportMeta())"
        >
          匯出 Excel
        </button>
        <button
          class="h-8 rounded bg-[var(--btn-pink)] px-4 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="exportingPdf"
          @click="handlePdfExport"
        >
          {{ exportingPdf ? "PDF 產製中..." : "匯出 PDF" }}
        </button>
      </div>
    </header>

    <section ref="reportRef" class="space-y-4 rounded border border-[var(--border-main)] bg-white p-5">
      <div class="border-b border-[var(--border-main)] pb-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h3 class="text-[20px] font-semibold text-[#3f4b58]">院內電腦關機稽核報表</h3>
            <p class="mt-1 text-[13px] text-[#6b7b8c]">稽核日期：{{ filters.auditDate }} ｜ 作用中群組：{{ activeScopeName }}</p>
          </div>
          <div class="rounded border border-[var(--border-soft)] bg-[#f8fbff] px-4 py-3 text-[12px] text-[#607082]">
            判定基準：下班 {{ policy.workEnd }} / 夜間 {{ policy.nightStart }} ~ {{ policy.nightEnd }}
          </div>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="report-kpi">
          <span>全院設備總數</span>
          <strong>{{ summary.totalDevices }}</strong>
        </div>
        <div class="report-kpi">
          <span>納管設備數</span>
          <strong>{{ summary.managedDevices }}</strong>
        </div>
        <div class="report-kpi">
          <span>應關機未關機</span>
          <strong>{{ summary.unshutdown }}</strong>
        </div>
        <div class="report-kpi">
          <span>最終觸發關機</span>
          <strong>{{ summary.triggered }}</strong>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="table-head-cell">項目</th>
              <th class="table-head-cell">數量</th>
              <th class="table-head-cell">說明</th>
            </tr>
          </thead>
          <tbody>
            <tr class="h-11">
              <td class="table-body-cell font-medium">正常關機</td>
              <td class="table-body-cell">{{ summary.normalShutdown }}</td>
              <td class="table-body-cell">於下班後、夜間起始前完成關機</td>
            </tr>
            <tr class="h-11">
              <td class="table-body-cell font-medium">不可關機</td>
              <td class="table-body-cell">{{ summary.cannotShutdown }}</td>
              <td class="table-body-cell">ICU、臨床或特殊用途設備，不納入一般關機政策</td>
            </tr>
            <tr class="h-11">
              <td class="table-body-cell font-medium">加班後關機</td>
              <td class="table-body-cell">{{ summary.overtimeShutdown }}</td>
              <td class="table-body-cell">於夜間判定區間內關機</td>
            </tr>
            <tr class="h-11">
              <td class="table-body-cell font-medium">未關機</td>
              <td class="table-body-cell">{{ summary.unshutdown }}</td>
              <td class="table-body-cell">可關機設備無關機紀錄，且未被政策自動觸發</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="table-head-cell">部門</th>
              <th class="table-head-cell">設備總數</th>
              <th class="table-head-cell">納管</th>
              <th class="table-head-cell">正常關機</th>
              <th class="table-head-cell">不可關機</th>
              <th class="table-head-cell">加班後關機</th>
              <th class="table-head-cell">未關機</th>
              <th class="table-head-cell">觸發關機</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in departmentRows" :key="row.department" class="h-11">
              <td class="table-body-cell font-medium">{{ row.department }}</td>
              <td class="table-body-cell">{{ row.total }}</td>
              <td class="table-body-cell">{{ row.managed }}</td>
              <td class="table-body-cell">{{ row.normalShutdown }}</td>
              <td class="table-body-cell">{{ row.cannotShutdown }}</td>
              <td class="table-body-cell">{{ row.overtimeShutdown }}</td>
              <td class="table-body-cell">{{ row.unshutdown }}</td>
              <td class="table-body-cell">{{ row.triggered }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="table-head-cell">電腦名稱</th>
              <th class="table-head-cell">資產編號</th>
              <th class="table-head-cell">部門 / 單位</th>
              <th class="table-head-cell">開機時間</th>
              <th class="table-head-cell">關機時間</th>
              <th class="table-head-cell">狀態</th>
              <th class="table-head-cell">觸發結果</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in deviceRows" :key="device.id" class="h-11">
              <td class="table-body-cell font-medium">{{ device.hostname }}</td>
              <td class="table-body-cell">{{ device.assetTag }}</td>
              <td class="table-body-cell">{{ device.department }} / {{ device.unit }}</td>
              <td class="table-body-cell">{{ device.bootAt }}</td>
              <td class="table-body-cell">{{ device.shutdownAt || "—" }}</td>
              <td class="table-body-cell">{{ device.derivedStatus }}</td>
              <td class="table-body-cell">{{ device.triggeredShutdownAt ? `已於 ${device.triggeredShutdownAt} 觸發` : "未觸發" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
