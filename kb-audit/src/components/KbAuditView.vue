<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  osGroups: {
    type: Array,
    required: true
  }
});

const layer = ref(1);
const selectedOsIndex = ref(0);
const secondLayerMode = ref("kb-list");
const selectedKbId = ref("");
const selectedDeviceHost = ref("");

const selectedOs = computed(() => props.osGroups[selectedOsIndex.value] ?? null);

const osSummaries = computed(() =>
  props.osGroups.map((group) => {
    const total = group.assets.length;
    const highRisk = group.assets.filter((item) => item.risk === "高" && item.missingKbs.length > 0).length;
    const unpatched = group.assets.filter((item) => item.missingKbs.length > 0).length;
    const patchRate = total === 0 ? "0.0%" : `${(((total - unpatched) / total) * 100).toFixed(1)}%`;
    return { osName: group.osName, total, highRisk, unpatched, patchRate };
  })
);

const kbRows = computed(() => {
  if (!selectedOs.value) return [];
  return selectedOs.value.kbCatalog
    .map((kb) => {
      const affected = selectedOs.value.assets.filter((asset) => asset.missingKbs.includes(kb.id));
      return { ...kb, affectedCount: affected.length, affectedDevices: affected };
    })
    .filter((item) => item.affectedCount > 0)
    .sort((a, b) => b.affectedCount - a.affectedCount);
});

const unpatchedDeviceRows = computed(() => {
  if (!selectedOs.value) return [];
  return selectedOs.value.assets.filter((item) => item.missingKbs.length > 0);
});

const selectedKb = computed(() => kbRows.value.find((row) => row.id === selectedKbId.value) ?? null);
const selectedDevice = computed(
  () => unpatchedDeviceRows.value.find((row) => row.hostname === selectedDeviceHost.value) ?? null
);

const thirdLayerTitle = computed(() => {
  if (!selectedOs.value) return "第 3 層報表";
  if (secondLayerMode.value === "kb-list") {
    return `${selectedOs.value.osName} - ${selectedKb.value?.id ?? ""} 缺漏安裝清單`;
  }
  return `${selectedOs.value.osName} - ${selectedDevice.value?.hostname ?? ""} 裝置詳情`;
});

const goLayer1 = () => {
  layer.value = 1;
};

const goLayer2 = () => {
  layer.value = 2;
};

const openKbList = (osIndex) => {
  selectedOsIndex.value = osIndex;
  secondLayerMode.value = "kb-list";
  selectedKbId.value = kbRows.value[0]?.id ?? "";
  layer.value = 2;
};

const openMissingList = (osIndex) => {
  selectedOsIndex.value = osIndex;
  secondLayerMode.value = "missing-list";
  selectedDeviceHost.value = unpatchedDeviceRows.value[0]?.hostname ?? "";
  layer.value = 2;
};

const openKbDevices = (kbId) => {
  selectedKbId.value = kbId;
  selectedDeviceHost.value = "";
  layer.value = 3;
};

const openDeviceDetail = (hostname) => {
  selectedDeviceHost.value = hostname;
  layer.value = 3;
};
</script>

<template>
  <div class="px-6 py-4">
    <header class="mb-4 rounded border border-[var(--border-main)] bg-white p-4">
      <h2 class="text-[18px] font-semibold text-[#3f4b58]">KB 安裝稽核列表</h2>
      <p class="mt-2 text-[13px] leading-6 text-[#667384]">
        三層式檢視：第 1 層 OS 分類匯總，第 2 層 KB 編號清單或缺漏安裝清單，第 3 層詳細報表。
      </p>
    </header>

    <section v-if="layer === 1" class="overflow-hidden rounded border border-[var(--border-main)] bg-white">
      <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-2 text-[13px] font-semibold text-[#607082]">
        第 1 層：OS 分類匯總視圖
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">作業系統</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">電腦總數</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">高風險項目</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">未修正項目</th>
              <th class="border-b border-[var(--border-main)] px-3 py-2">整體修正率</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(summary, index) in osSummaries" :key="summary.osName" class="h-11 hover:bg-[#f8fbff]">
              <td class="border-b border-r border-[var(--border-soft)] px-3 font-medium">{{ summary.osName }}</td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">{{ summary.total }}</td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">
                <button
                  class="rounded border border-[#f4c8c8] bg-[#fff3f3] px-2 py-0.5 text-[#c84a4a] hover:bg-[#ffecec]"
                  @click="openKbList(index)"
                >
                  {{ summary.highRisk }}
                </button>
              </td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">
                <button
                  class="rounded border border-[#f0d7a8] bg-[#fff8ea] px-2 py-0.5 text-[#a37214] hover:bg-[#fff2d8]"
                  @click="openMissingList(index)"
                >
                  {{ summary.unpatched }}
                </button>
              </td>
              <td class="border-b border-[var(--border-soft)] px-3 font-medium text-[#2f7d4b]">{{ summary.patchRate }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else-if="layer === 2" class="overflow-hidden rounded border border-[var(--border-main)] bg-white">
      <div class="flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-2">
        <h3 class="text-[13px] font-semibold text-[#607082]">
          第 2 層：
          {{ secondLayerMode === "kb-list" ? `${selectedOs?.osName} KB 編號清單` : `${selectedOs?.osName} 缺漏安裝清單` }}
        </h3>
        <button class="rounded border border-[var(--border-main)] bg-white px-3 py-1 text-[12px]" @click="goLayer1">
          上一頁
        </button>
      </div>

      <div v-if="secondLayerMode === 'kb-list'" class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">KB 編號</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">更新說明</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">風險等級</th>
              <th class="border-b border-[var(--border-main)] px-3 py-2">缺漏裝置數</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="kb in kbRows" :key="kb.id" class="h-10 hover:bg-[#f8fbff]">
              <td class="border-b border-r border-[var(--border-soft)] px-3">
                <button class="font-medium text-[#365b8a] underline-offset-2 hover:underline" @click="openKbDevices(kb.id)">
                  {{ kb.id }}
                </button>
              </td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">{{ kb.title }}</td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">
                <span
                  class="rounded px-2 py-0.5 text-[12px]"
                  :class="kb.severity === '高' ? 'bg-[#fff0f0] text-[#ba3b3b]' : 'bg-[#fff8ea] text-[#9f7425]'"
                >
                  {{ kb.severity }}
                </span>
              </td>
              <td class="border-b border-[var(--border-soft)] px-3">{{ kb.affectedCount }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">裝置名稱</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">IP</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">風險等級</th>
              <th class="border-b border-[var(--border-main)] px-3 py-2">未安裝 KB 數</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in unpatchedDeviceRows" :key="device.hostname" class="h-10 hover:bg-[#f8fbff]">
              <td class="border-b border-r border-[var(--border-soft)] px-3">
                <button
                  class="font-medium text-[#365b8a] underline-offset-2 hover:underline"
                  @click="openDeviceDetail(device.hostname)"
                >
                  {{ device.hostname }}
                </button>
              </td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">{{ device.ip }}</td>
              <td class="border-b border-r border-[var(--border-soft)] px-3">{{ device.risk }}</td>
              <td class="border-b border-[var(--border-soft)] px-3">{{ device.missingKbs.length }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-else class="overflow-hidden rounded border border-[var(--border-main)] bg-white">
      <div class="flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-2">
        <h3 class="text-[13px] font-semibold text-[#607082]">第 3 層：{{ thirdLayerTitle }}</h3>
        <button class="rounded border border-[var(--border-main)] bg-white px-3 py-1 text-[12px]" @click="goLayer2">
          上一頁
        </button>
      </div>

      <div v-if="secondLayerMode === 'kb-list'" class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">裝置名稱</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">IP</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">風險等級</th>
              <th class="border-b border-r border-[var(--border-main)] px-3 py-2">負責單位</th>
              <th class="border-b border-[var(--border-main)] px-3 py-2">最後回報時間</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="device in selectedKb?.affectedDevices ?? []" :key="device.hostname">
              <tr class="h-10 hover:bg-[#fafcff]">
                <td class="border-b border-r border-[var(--border-soft)] px-3">
                  <button
                    class="font-medium text-[#365b8a] underline-offset-2 hover:underline"
                    @click="selectedDeviceHost = selectedDeviceHost === device.hostname ? '' : device.hostname"
                  >
                    {{ device.hostname }}
                  </button>
                </td>
                <td class="border-b border-r border-[var(--border-soft)] px-3">{{ device.ip }}</td>
                <td class="border-b border-r border-[var(--border-soft)] px-3">{{ device.risk }}</td>
                <td class="border-b border-r border-[var(--border-soft)] px-3">{{ device.owner }}</td>
                <td class="border-b border-[var(--border-soft)] px-3">{{ device.lastSeen }}</td>
              </tr>
              <tr v-if="selectedDeviceHost === device.hostname" class="bg-[#f8fbff]">
                <td colspan="5" class="border-b border-[var(--border-soft)] p-3">
                  <div class="rounded border border-[var(--border-main)] bg-white p-3 text-[13px] text-[#4f5b67]">
                    <div class="mb-2 grid gap-1 md:grid-cols-2">
                      <p><span class="font-semibold">裝置名稱：</span>{{ device.hostname }}</p>
                      <p><span class="font-semibold">IP：</span>{{ device.ip }}</p>
                      <p><span class="font-semibold">風險等級：</span>{{ device.risk }}</p>
                      <p><span class="font-semibold">負責單位：</span>{{ device.owner }}</p>
                    </div>
                    <div class="overflow-x-auto">
                      <table class="w-full text-left text-[13px]">
                        <thead class="bg-[#f8fafc] text-[#6e7d8d]">
                          <tr>
                            <th class="border-b border-r border-[var(--border-main)] px-3 py-2">缺漏 KB</th>
                            <th class="border-b border-[var(--border-main)] px-3 py-2">更新說明</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="kbId in device.missingKbs" :key="kbId" class="h-9">
                            <td class="border-b border-r border-[var(--border-soft)] px-3">{{ kbId }}</td>
                            <td class="border-b border-[var(--border-soft)] px-3">
                              {{ selectedOs?.kbCatalog.find((k) => k.id === kbId)?.title ?? "-" }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div v-else class="p-4 text-[13px] text-[#4f5b67]">
        <div class="mb-3 rounded border border-[var(--border-main)] bg-[#f8fafc] p-3">
          <p><span class="font-semibold">裝置名稱：</span>{{ selectedDevice?.hostname ?? "-" }}</p>
          <p><span class="font-semibold">IP：</span>{{ selectedDevice?.ip ?? "-" }}</p>
          <p><span class="font-semibold">風險等級：</span>{{ selectedDevice?.risk ?? "-" }}</p>
          <p><span class="font-semibold">負責單位：</span>{{ selectedDevice?.owner ?? "-" }}</p>
          <p><span class="font-semibold">最後回報時間：</span>{{ selectedDevice?.lastSeen ?? "-" }}</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-[13px]">
            <thead class="bg-[#f8fafc] text-[#6e7d8d]">
              <tr>
                <th class="border-b border-r border-[var(--border-main)] px-3 py-2">缺漏 KB</th>
                <th class="border-b border-[var(--border-main)] px-3 py-2">更新說明</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kbId in selectedDevice?.missingKbs ?? []" :key="kbId" class="h-10">
                <td class="border-b border-r border-[var(--border-soft)] px-3">{{ kbId }}</td>
                <td class="border-b border-[var(--border-soft)] px-3">
                  {{ selectedOs?.kbCatalog.find((k) => k.id === kbId)?.title ?? "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
