<script setup>
defineProps({
  filters: {
    type: Object,
    required: true
  },
  savedScopes: {
    type: Array,
    required: true
  },
  options: {
    type: Object,
    required: true
  },
  activeScopeDescription: {
    type: String,
    required: true
  }
});

const emit = defineEmits(["update-filter", "reset-filters"]);

const updateField = (field, event) => {
  emit("update-filter", { field, value: event.target.value });
};
</script>

<template>
  <section class="border-b border-[var(--border-main)] bg-white px-6 py-4">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <h1 class="text-[22px] font-semibold text-[#3f4b58]">院內電腦關機管理 POC</h1>
        <p class="mt-1 text-[13px] leading-6 text-[#667384]">
          聚焦資料蒐集、納管範圍設定與正式稽核報表輸出，作為節能管理與內部稽核依據。
        </p>
      </div>

      <button
        class="h-9 rounded border border-[var(--border-main)] bg-[#f8fafc] px-4 text-[12px] font-semibold text-[#516071]"
        @click="emit('reset-filters')"
      >
        清除條件
      </button>
    </div>

    <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <label class="toolbar-field">
        <span>稽核日期</span>
        <input :value="filters.auditDate" type="date" @input="updateField('auditDate', $event)" />
      </label>

      <label class="toolbar-field">
        <span>作用中群組</span>
        <select :value="filters.scopeId" @change="updateField('scopeId', $event)">
          <option v-for="scope in savedScopes" :key="scope.id" :value="scope.id">{{ scope.name }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>設備群組</span>
        <select :value="filters.groupName" @change="updateField('groupName', $event)">
          <option value="">全部</option>
          <option v-for="groupName in options.groupNames" :key="groupName" :value="groupName">{{ groupName }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>院區 / 場域</span>
        <select :value="filters.site" @change="updateField('site', $event)">
          <option value="">全部</option>
          <option v-for="site in options.sites" :key="site" :value="site">{{ site }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>部門</span>
        <select :value="filters.department" @change="updateField('department', $event)">
          <option value="">全部</option>
          <option v-for="department in options.departments" :key="department" :value="department">{{ department }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>單位</span>
        <select :value="filters.unit" @change="updateField('unit', $event)">
          <option value="">全部</option>
          <option v-for="unit in options.units" :key="unit" :value="unit">{{ unit }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>區域</span>
        <select :value="filters.area" @change="updateField('area', $event)">
          <option value="">全部</option>
          <option v-for="area in options.areas" :key="area" :value="area">{{ area }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>設備屬性</span>
        <select :value="filters.attribute" @change="updateField('attribute', $event)">
          <option value="">全部</option>
          <option v-for="attribute in options.attributes" :key="attribute" :value="attribute">{{ attribute }}</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>關機分類</span>
        <select :value="filters.powerClass" @change="updateField('powerClass', $event)">
          <option value="">全部</option>
          <option value="shutdown-only">可關機設備</option>
          <option value="non-shutdown">不可關機設備</option>
        </select>
      </label>

      <label class="toolbar-field">
        <span>稽核狀態</span>
        <select :value="filters.status" @change="updateField('status', $event)">
          <option value="">全部</option>
          <option value="正常關機">正常關機</option>
          <option value="不可關機">不可關機</option>
          <option value="群組排除">群組排除</option>
          <option value="加班後關機">加班後關機</option>
          <option value="未關機">未關機</option>
          <option value="已觸發關機">已觸發關機</option>
        </select>
      </label>
    </div>

    <div class="mt-3 rounded border border-[#dbe6ef] bg-[#f8fbff] px-4 py-3 text-[12px] text-[#5b6c7d]">
      <span class="font-semibold text-[#334659]">作用中群組條件：</span>
      <span>{{ activeScopeDescription }}</span>
    </div>
  </section>
</template>
