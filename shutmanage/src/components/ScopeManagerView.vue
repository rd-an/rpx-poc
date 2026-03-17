<script setup>
defineProps({
  savedScopes: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  },
  scopeDraftName: {
    type: String,
    required: true
  },
  scopeDraftDescription: {
    type: String,
    required: true
  },
  previewRows: {
    type: Array,
    required: true
  },
  canSaveScope: {
    type: Boolean,
    required: true
  }
});

defineEmits([
  "update-draft-name",
  "update-draft-description",
  "save-scope",
  "apply-scope",
  "remove-scope"
]);
</script>

<template>
  <div class="space-y-4 px-6 py-4">
    <div class="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
      <section class="rounded border border-[var(--border-main)] bg-white">
        <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
          <h2 class="text-[14px] font-semibold text-[#4a5b6d]">自定義群組保存與重複使用</h2>
        </div>

        <div class="space-y-4 p-4">
          <div class="grid gap-3 md:grid-cols-2">
            <label class="toolbar-field">
              <span>群組名稱</span>
              <input
                :value="scopeDraftName"
                type="text"
                placeholder="例如：行政白班設備"
                @input="$emit('update-draft-name', $event.target.value)"
              />
            </label>

            <label class="toolbar-field">
              <span>用途說明</span>
              <input
                :value="scopeDraftDescription"
                type="text"
                placeholder="例如：追蹤行政處下班未關機設備"
                @input="$emit('update-draft-description', $event.target.value)"
              />
            </label>
          </div>

          <div class="rounded border border-[#dbe6ef] bg-[#f8fbff] px-4 py-3 text-[12px] leading-6 text-[#5b6c7d]">
            目前會把上方篩選列中的群組、院區、部門、單位、區域、設備屬性與可關機分類保存成可重複使用的納管群組。
          </div>

          <button
            class="h-9 rounded bg-[var(--btn-blue)] px-4 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
            :disabled="!canSaveScope"
            @click="$emit('save-scope')"
          >
            儲存為永久群組
          </button>
        </div>
      </section>

      <section class="rounded border border-[var(--border-main)] bg-white">
        <div class="border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
          <h2 class="text-[14px] font-semibold text-[#4a5b6d]">已保存群組</h2>
        </div>

        <div class="grid gap-3 p-4">
          <article
            v-for="scope in savedScopes"
            :key="scope.id"
            class="rounded border border-[var(--border-soft)] bg-[#fbfcfe] p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-[#3f4b58]">{{ scope.name }}</p>
                <p class="mt-1 text-[12px] leading-5 text-[#647486]">{{ scope.description }}</p>
              </div>
              <span v-if="filters.scopeId === scope.id" class="rounded bg-[#e8f3ff] px-2 py-1 text-[12px] font-semibold text-[#2f6aa7]">
                作用中
              </span>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="(value, key) in scope.criteria"
                :key="`${scope.id}-${key}`"
                class="rounded border border-[#dbe6ef] bg-white px-2 py-1 text-[12px] text-[#5b6c7d]"
                v-show="value !== '' && value !== null"
              >
                {{ key }}：{{ value === true ? "可關機" : value === false ? "不可關機" : value }}
              </span>
            </div>

            <div class="mt-3 flex gap-2">
              <button
                class="h-8 rounded bg-[var(--btn-green)] px-3 text-[12px] font-semibold text-white"
                @click="$emit('apply-scope', scope.id)"
              >
                套用群組
              </button>
              <button
                v-if="scope.id !== 'all'"
                class="h-8 rounded bg-[var(--btn-pink)] px-3 text-[12px] font-semibold text-white"
                @click="$emit('remove-scope', scope.id)"
              >
                刪除
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <section class="overflow-hidden rounded border border-[var(--border-main)] bg-white">
      <div class="flex items-center justify-between border-b border-[var(--border-main)] bg-[var(--table-head)] px-4 py-3">
        <h2 class="text-[14px] font-semibold text-[#4a5b6d]">納管設備預覽</h2>
        <span class="text-[12px] text-[#6c7b8c]">共 {{ previewRows.length }} 台設備</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-[13px] text-[#4f5b67]">
          <thead class="bg-[#f8fafc] text-[#6e7d8d]">
            <tr>
              <th class="table-head-cell">電腦名稱</th>
              <th class="table-head-cell">資產編號</th>
              <th class="table-head-cell">部門 / 單位</th>
              <th class="table-head-cell">場域</th>
              <th class="table-head-cell">設備屬性</th>
              <th class="table-head-cell">可關機</th>
              <th class="table-head-cell">狀態</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="device in previewRows" :key="device.id" class="h-11 hover:bg-[#f8fbff]">
              <td class="table-body-cell font-medium">{{ device.hostname }}</td>
              <td class="table-body-cell">{{ device.assetTag }}</td>
              <td class="table-body-cell">{{ device.department }} / {{ device.unit }}</td>
              <td class="table-body-cell">{{ device.site }} / {{ device.area }}</td>
              <td class="table-body-cell">{{ device.attribute }}</td>
              <td class="table-body-cell">{{ device.canShutdown ? "可關機" : "不可關機" }}</td>
              <td class="table-body-cell">
                <span class="status-pill" :class="device.derivedStatus">{{ device.derivedStatus }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
