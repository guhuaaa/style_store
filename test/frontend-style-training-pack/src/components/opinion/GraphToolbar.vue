<template>
  <header class="graph-toolbar">
    <div class="toolbar-main">
      <div class="brand-line">
        <span class="product-name">衣鱼 · 舆情关系图谱</span>
        <span v-if="overview.title" class="event-name">{{ overview.title }}</span>
      </div>
      <div class="meta-line">
        <span class="meta-item" :class="`status-${statusType}`">
          <span class="status-dot"></span>
          {{ statusText }}
        </span>
        <span v-if="updateTime" class="meta-item">更新于 {{ updateTime }}</span>
        <span class="meta-item">{{ entityCount }} 个主体 · {{ relationshipCount }} 条关系</span>
      </div>
    </div>

    <div class="toolbar-actions">
      <el-button
        v-if="showBack"
        size="small"
        :icon="ArrowLeft"
        @click="emit('back')"
      >
        返回工作流
      </el-button>
      <el-input
        v-model="localKeyword"
        size="small"
        clearable
        placeholder="搜索主体"
        :prefix-icon="Search"
        class="toolbar-search"
        @keyup.enter="emit('search', localKeyword)"
        @clear="emit('search', '')"
      />
      <el-button size="small" :icon="Refresh" :loading="loading" @click="emit('refresh')">刷新</el-button>
      <el-button size="small" :icon="FullScreen" @click="emit('fit')">适配</el-button>
      <el-button size="small" :icon="Share" @click="emit('export')">导出</el-button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowLeft, FullScreen, Refresh, Search, Share } from '@element-plus/icons-vue'

const props = defineProps({
  overview: { type: Object, default: () => ({}) },
  entityCount: { type: Number, default: 0 },
  relationshipCount: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  status: { type: String, default: 'idle' },
  updateTime: { type: String, default: '' },
  searchKeyword: { type: String, default: '' },
  showBack: { type: Boolean, default: false }
})

const emit = defineEmits(['refresh', 'fit', 'export', 'search', 'back'])

const localKeyword = ref(props.searchKeyword)

watch(() => props.searchKeyword, (val) => {
  localKeyword.value = val
})

const statusText = computed(() => {
  const map = {
    idle: '等待数据',
    loading: '分析中',
    success: '分析完成',
    error: '分析失败'
  }
  return map[props.status] || props.status
})

const statusType = computed(() => props.status)
</script>

<style scoped>
.graph-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  padding: 0 20px;
  background-color: var(--og-surface, #fff);
  border-bottom: 1px solid var(--og-border, #E3E1DC);
  flex-shrink: 0;
}

.toolbar-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.product-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--og-text-primary, #202225);
  white-space: nowrap;
}

.event-name {
  font-size: 0.8rem;
  color: var(--og-text-secondary, #5A5852);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.72rem;
  color: var(--og-text-muted, #73716C);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-loading .status-dot {
  animation: pulse 1.4s ease-in-out infinite;
}

.status-success { color: #5A9A8F; }
.status-loading { color: #C89F5E; }
.status-error { color: #C75C5C; }
.status-idle { color: #8E8C86; }

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toolbar-search {
  width: 180px;
}

.toolbar-search :deep(.el-input__wrapper) {
  border-radius: 8px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 1100px) {
  .event-name {
    display: none;
  }
  .toolbar-search {
    width: 140px;
  }
}
</style>
