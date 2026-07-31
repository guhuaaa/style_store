<template>
  <header class="app-header">
    <div class="header-left">
      <div class="breadcrumb">
        <span class="page-title">{{ pageTitle }}</span>
        <span v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</span>
      </div>
    </div>

    <div class="header-right">
      <button
        class="icon-btn"
        type="button"
        :title="appStore.isDark ? '切换亮色' : '切换暗色'"
        :aria-label="appStore.isDark ? '切换亮色' : '切换暗色'"
        @click="appStore.toggleTheme"
      >
        <el-icon size="18"><Sunny v-if="appStore.isDark" /><Moon v-else /></el-icon>
      </button>

      <div class="user-profile">
        <div class="avatar" aria-hidden="true">
          <el-icon size="18"><User /></el-icon>
        </div>
        <span class="username">风险分析师</span>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'

const route = useRoute()
const appStore = useAppStore()

const pageTitle = computed(() => route.meta?.title || '舆情总览')
const pageSubtitle = computed(() => {
  const map = {
    Dashboard: '实时监测金融舆情动态',
    Monitor: '配置数据源与监控规则',
    Analysis: '构建知识图谱并推演风险扩散',
    Simulation: '实时追踪智能体舆情演化',
    Report: '生成舆情风险分析报告',
    Settings: '配置 API 与系统参数'
  }
  return map[route.name] || ''
})
</script>

<style scoped>
.app-header {
  height: 64px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 96%, transparent), color-mix(in srgb, var(--ui-surface-muted) 72%, transparent)),
    var(--craft-fiber);
  border-bottom: 1px solid color-mix(in srgb, var(--rl-border) 88%, var(--ui-ink));
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  box-shadow: 0 1px 0 color-mix(in srgb, var(--ui-surface) 80%, transparent) inset;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.breadcrumb {
  min-width: 0;
}

.page-title {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--rl-text-primary);
  letter-spacing: 0;
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--rl-text-muted);
  padding-left: 12px;
  border-left: 2px solid var(--ui-gold);
  margin-left: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border: 1px solid var(--rl-border);
  border-radius: var(--craft-radius);
  background: color-mix(in srgb, var(--rl-surface) 78%, var(--ui-paper));
  color: var(--rl-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s, background-color 0.2s;
}

.icon-btn:hover,
.icon-btn:focus-visible {
  border-color: var(--rl-gold);
  background: color-mix(in srgb, var(--ui-gold) 12%, var(--rl-surface));
  color: var(--ui-sap);
  outline: none;
}

.icon-btn:focus-visible {
  box-shadow: 0 0 0 3px var(--ui-focus-ring);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border: 1px solid var(--rl-border);
  border-radius: var(--craft-radius);
  background: color-mix(in srgb, var(--rl-surface) 68%, var(--ui-paper));
  margin-left: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 34% 28%, color-mix(in srgb, var(--ui-gold) 26%, transparent), transparent 38%),
    var(--ui-paper);
  border: 1px solid var(--ui-sap);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ui-sap);
}

.username {
  font-size: 0.85rem;
  color: var(--rl-text-secondary);
  white-space: nowrap;
}

@media (max-width: 760px) {
  .page-subtitle,
  .user-profile {
    display: none;
  }
}
</style>
