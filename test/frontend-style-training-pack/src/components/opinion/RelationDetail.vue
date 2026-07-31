<template>
  <div class="relation-detail">
    <div class="detail-header">
      <div class="header-main">
        <span class="relation-line" :style="{ backgroundColor: relation.typeColor }"></span>
        <div class="header-text">
          <h4 class="relation-title">{{ relation.typeLabel }}</h4>
          <div class="route-line">
            <span class="route-node">{{ relation.sourceName }}</span>
            <span class="route-arrow" :style="{ color: relation.typeColor }">→</span>
            <span class="route-node">{{ relation.targetName }}</span>
          </div>
        </div>
      </div>
      <button class="close-btn" @click="emit('close')">
        <el-icon size="14"><Close /></el-icon>
      </button>
    </div>

    <div class="detail-body">
      <div class="badge-row">
        <span v-if="relation.directed" class="badge">有方向</span>
        <span v-else class="badge">无方向</span>
        <span v-if="relation.inferred" class="badge inferred">系统推测</span>
        <span v-else class="badge confirmed">文本明确</span>
      </div>

      <div class="metric-row">
        <div class="metric-card">
          <span class="metric-value">{{ relation.weight }}</span>
          <span class="metric-label">关系强度</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ confidencePercent }}</span>
          <span class="metric-label">可信度</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ relation.evidence?.length || 0 }}</span>
          <span class="metric-label">证据条数</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">情感倾向</span>
          <span class="info-value" :style="{ color: sentimentColor }">{{ sentimentLabel }}</span>
        </div>
        <div v-if="relation.firstTime" class="info-row">
          <span class="info-label">首次出现</span>
          <span class="info-value">{{ relation.firstTime }}</span>
        </div>
        <div v-if="relation.lastTime" class="info-row">
          <span class="info-label">最近出现</span>
          <span class="info-value">{{ relation.lastTime }}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">原文证据</div>
        <div v-if="relation.evidence?.length" class="evidence-list">
          <div v-for="(evidence, idx) in relation.evidence" :key="idx" class="evidence-card">
            <p class="evidence-text">{{ evidence.text || evidence }}</p>
            <div v-if="evidence.source || evidence.time" class="evidence-meta">
              <span v-if="evidence.source">{{ evidence.source }}</span>
              <span v-if="evidence.time">{{ evidence.time }}</span>
            </div>
          </div>
        </div>
        <div v-else-if="relation.fact" class="evidence-card">
          <p class="evidence-text">{{ relation.fact }}</p>
        </div>
        <div v-else class="empty-tip">暂无原文证据</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { sentimentTypes } from '../../config/opinionGraph.js'

const props = defineProps({
  relation: { type: Object, required: true }
})

const emit = defineEmits(['close'])

const sentimentConfig = computed(() => sentimentTypes[props.relation.sentiment] || sentimentTypes.neutral)
const sentimentLabel = computed(() => sentimentConfig.value.label)
const sentimentColor = computed(() => sentimentConfig.value.color)
const confidencePercent = computed(() => `${Math.round((props.relation.confidence || 0) * 100)}%`)
</script>

<style scoped>
.relation-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--og-surface, #fff);
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--og-border, #E3E1DC);
}

.header-main {
  display: flex;
  gap: 10px;
  min-width: 0;
}

.relation-line {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.header-text {
  min-width: 0;
}

.relation-title {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--og-text-primary, #202225);
}

.route-line {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--og-text-secondary, #5A5852);
  flex-wrap: wrap;
}

.route-node {
  color: var(--og-text-primary, #202225);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.route-arrow {
  font-weight: 700;
}

.close-btn {
  width: 26px;
  height: 26px;
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 6px;
  background: transparent;
  color: var(--og-text-muted, #73716C);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.close-btn:hover {
  border-color: var(--og-danger, #C75C5C);
  color: var(--og-danger, #C75C5C);
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.badge {
  display: inline-flex;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  background-color: var(--og-surface-elevated, #FAFAF8);
  color: var(--og-text-secondary, #5A5852);
  border: 1px solid var(--og-border, #E3E1DC);
}

.badge.confirmed {
  background-color: rgba(90, 154, 143, 0.1);
  color: #5A9A8F;
  border-color: rgba(90, 154, 143, 0.3);
}

.badge.inferred {
  background-color: rgba(200, 159, 94, 0.1);
  color: #C89F5E;
  border-color: rgba(200, 159, 94, 0.3);
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-radius: 10px;
  border: 1px solid var(--og-border, #E3E1DC);
}

.metric-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--og-text-primary, #202225);
}

.metric-label {
  font-size: 0.68rem;
  color: var(--og-text-muted, #73716C);
}

.info-section {
  margin-bottom: 18px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--og-text-muted, #73716C);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--og-border, #E3E1DC);
  font-size: 0.8rem;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--og-text-muted, #73716C);
}

.info-value {
  color: var(--og-text-primary, #202225);
  font-weight: 500;
  text-align: right;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-card {
  padding: 10px 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 8px;
  border-left: 3px solid var(--og-primary, #4056A1);
}

.evidence-text {
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--og-text-secondary, #5A5852);
  margin: 0 0 6px;
  overflow-wrap: anywhere;
}

.evidence-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.68rem;
  color: var(--og-text-muted, #73716C);
}

.empty-tip {
  font-size: 0.78rem;
  color: var(--og-text-muted, #73716C);
  padding: 12px;
  text-align: center;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-radius: 8px;
}
</style>
