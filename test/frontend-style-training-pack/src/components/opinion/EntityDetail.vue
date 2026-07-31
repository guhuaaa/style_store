<template>
  <div class="entity-detail">
    <div class="detail-header">
      <div class="header-main">
        <span class="entity-stripe" :style="{ backgroundColor: entity.typeColor }"></span>
        <span class="entity-icon" :style="{ backgroundColor: entity.typeColor }">
          <el-icon size="14" color="#fff"><component :is="entity.typeIcon" /></el-icon>
        </span>
        <div class="header-text">
          <h4 class="entity-name">{{ entity.name }}</h4>
          <div class="entity-tags">
            <span class="tag type-tag" :style="{ backgroundColor: tagBackground(entity.typeColor), color: entity.typeColor }">
              {{ entity.typeLabel }}
            </span>
            <span v-if="entity.networkRoleLabel" class="tag role-tag">{{ entity.networkRoleLabel }}</span>
          </div>
        </div>
      </div>
      <button class="close-btn" @click="emit('close')">
        <el-icon size="14"><Close /></el-icon>
      </button>
    </div>

    <div class="detail-body">
      <div v-if="entity.typeRole || entity.isAgentEligible !== undefined" class="badge-row">
        <span v-if="entity.typeRole" class="badge">{{ entity.typeRole }}</span>
        <span v-if="entity.isAgentEligible === true" class="badge eligible">可参与推演</span>
        <span v-else-if="entity.isAgentEligible === false" class="badge ineligible">不参与推演</span>
      </div>

      <p v-if="entity.description" class="entity-desc">{{ entity.description }}</p>

      <div class="metric-row">
        <div class="metric-card">
          <span class="metric-value" :class="influenceClass">{{ entity.influence }}</span>
          <span class="metric-label">影响力指数</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ entity.degree }}</span>
          <span class="metric-label">关联数</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{{ entity.evidenceCount || relatedEdges.length }}</span>
          <span class="metric-label">证据数</span>
        </div>
      </div>

      <div v-if="hasNetworkMetrics" class="info-section">
        <div class="section-title">网络结构指标</div>
        <div class="network-metrics">
          <div class="metric-bar">
            <div class="bar-head">
              <span class="bar-label">出度</span>
              <span class="bar-value">{{ entity.outDegree }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-out" :style="{ width: outDegreePercent }"></div>
            </div>
          </div>
          <div class="metric-bar">
            <div class="bar-head">
              <span class="bar-label">入度</span>
              <span class="bar-value">{{ entity.inDegree }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-in" :style="{ width: inDegreePercent }"></div>
            </div>
          </div>
          <div v-if="betweennessPercent !== null" class="metric-bar">
            <div class="bar-head">
              <span class="bar-label">中介中心性</span>
              <span class="bar-value">{{ betweennessPercent }}</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-between" :style="{ width: betweennessPercent }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">立场</span>
          <span class="info-value" :style="{ color: stanceColor }">{{ stanceLabel }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">情感倾向</span>
          <span class="info-value" :style="{ color: sentimentColor }">{{ sentimentLabel }}</span>
        </div>
        <div v-if="entity.camp" class="info-row">
          <span class="info-label">所属阵营</span>
          <span class="info-value">{{ entity.camp }}</span>
        </div>
        <div v-if="entity.aliases?.length" class="info-row">
          <span class="info-label">别名</span>
          <span class="info-value">{{ entity.aliases.join('、') }}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="section-title">网络角色说明</div>
        <p class="role-desc">{{ entity.networkRoleDesc || '该主体在舆情网络中处于边缘位置，关联关系较少。' }}</p>
      </div>

      <div class="info-section">
        <div class="section-title">主要关联</div>
        <div class="relation-list">
          <div
            v-for="edge in relatedEdges"
            :key="edge.id"
            class="relation-row"
            :class="{ active: selectedRelationId === edge.id }"
            @click="emit('select-relation', edge)"
          >
            <div class="relation-main">
              <span class="relation-direction">{{ edge.directionText }}</span>
              <span class="relation-peer">{{ edge.peerName }}</span>
            </div>
            <div class="relation-meta">
              <span class="relation-type" :style="{ color: edge.color }">{{ edge.typeLabel }}</span>
              <span v-if="edge.inferred" class="mini-badge inferred">推测</span>
              <span v-else class="mini-badge confirmed">原文</span>
            </div>
          </div>
          <div v-if="!relatedEdges.length" class="empty-tip">暂无直接关系</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { stanceTypes, sentimentTypes } from '../../config/opinionGraph.js'

const props = defineProps({
  entity: { type: Object, required: true },
  relationships: { type: Array, default: () => [] },
  entityById: { type: Map, default: () => new Map() },
  selectedRelationId: { type: String, default: '' }
})

const emit = defineEmits(['close', 'select-relation'])

const stanceConfig = computed(() => stanceTypes[props.entity.stance] || stanceTypes.unknown)
const stanceLabel = computed(() => stanceConfig.value.label)
const stanceColor = computed(() => stanceConfig.value.color)

const sentimentConfig = computed(() => sentimentTypes[props.entity.sentiment] || sentimentTypes.neutral)
const sentimentLabel = computed(() => sentimentConfig.value.label)
const sentimentColor = computed(() => sentimentConfig.value.color)

function tagBackground(color) {
  return `${color}1A`
}

const influenceClass = computed(() => {
  const v = Number(props.entity.influence)
  if (!Number.isFinite(v)) return ''
  if (v >= 70) return 'influence-high'
  if (v >= 40) return 'influence-mid'
  return 'influence-low'
})

const hasNetworkMetrics = computed(() => {
  const e = props.entity
  return Number.isFinite(Number(e.outDegree)) || Number.isFinite(Number(e.inDegree)) || e.betweenness !== undefined
})

const totalDegree = computed(() => {
  const out = Number(props.entity.outDegree) || 0
  const inn = Number(props.entity.inDegree) || 0
  return Math.max(1, out + inn)
})

const outDegreePercent = computed(() => {
  const out = Number(props.entity.outDegree) || 0
  return `${Math.round((out / totalDegree.value) * 100)}%`
})

const inDegreePercent = computed(() => {
  const inn = Number(props.entity.inDegree) || 0
  return `${Math.round((inn / totalDegree.value) * 100)}%`
})

const betweennessPercent = computed(() => {
  const v = Number(props.entity.betweenness)
  if (!Number.isFinite(v)) return null
  return `${Math.round(v * 100)}%`
})

const relatedEdges = computed(() => {
  return props.relationships
    .filter(edge => edge.source === props.entity.uuid || edge.target === props.entity.uuid)
    .map((edge) => {
      const isSource = edge.source === props.entity.uuid
      const peerId = isSource ? edge.target : edge.source
      const peer = props.entityById.get(peerId)
      return {
        ...edge,
        peerName: peer?.name || peerId,
        directionText: isSource ? '→' : '←',
        color: edge.typeColor
      }
    })
    .sort((a, b) => b.weight - a.weight)
})
</script>

<style scoped>
.entity-detail {
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

.entity-stripe {
  width: 4px;
  align-self: stretch;
  border-radius: 2px;
  flex-shrink: 0;
  min-height: 40px;
}

.entity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text {
  min-width: 0;
}

.entity-name {
  margin: 0 0 6px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--og-text-primary, #202225);
  overflow-wrap: anywhere;
}

.entity-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.type-tag {
  background-color: rgba(64, 86, 161, 0.1);
}

.role-tag {
  background-color: var(--og-surface-elevated, #FAFAF8);
  color: var(--og-text-secondary, #5A5852);
  border: 1px solid var(--og-border, #E3E1DC);
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

.badge.eligible {
  background-color: rgba(90, 154, 143, 0.1);
  color: var(--og-safe, #5A9A8F);
  border-color: rgba(90, 154, 143, 0.3);
}

.badge.ineligible {
  background-color: var(--og-surface-elevated, #FAFAF8);
  color: var(--og-text-muted, #73716C);
  border-color: var(--og-divider, #DEDCD6);
}

.entity-desc {
  font-size: 0.82rem;
  line-height: 1.65;
  color: var(--og-text-secondary, #5A5852);
  margin: 0 0 16px;
  padding: 10px 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-left: 3px solid var(--og-divider, #DEDCD6);
  border-radius: 4px;
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

.metric-value.influence-high {
  color: var(--og-danger, #C75C5C);
}

.metric-value.influence-mid {
  color: var(--og-warning, #C89F5E);
}

.metric-value.influence-low {
  color: var(--og-slate, #7A8699);
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

.network-metrics {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 8px;
}

.metric-bar {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-head {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: var(--og-text-muted, #73716C);
}

.bar-label {
  color: var(--og-text-secondary, #5A5852);
  font-weight: 500;
}

.bar-value {
  color: var(--og-ink, #2C2E33);
  font-weight: 600;
}

.bar-track {
  height: 6px;
  background-color: var(--og-surface-hover, #F0EEEA);
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.bar-out {
  background-color: var(--og-primary, #4056A1);
}

.bar-in {
  background-color: var(--og-slate, #7A8699);
}

.bar-between {
  background-color: var(--og-warning, #C89F5E);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--og-divider, #DEDCD6);
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
  overflow-wrap: anywhere;
}

.role-desc {
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--og-text-secondary, #5A5852);
  margin: 0;
  padding: 10px 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-left: 3px solid var(--og-primary, #4056A1);
  border-radius: 4px;
}

.relation-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.relation-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s;
}

.relation-row:hover,
.relation-row.active {
  border-color: var(--og-primary, #4056A1);
  background-color: var(--og-surface-hover, #F0EEEA);
}

.relation-main {
  display: grid;
  grid-template-columns: 24px 1fr;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
}

.relation-direction {
  color: var(--og-text-muted, #73716C);
  font-weight: 600;
  text-align: center;
}

.relation-peer {
  color: var(--og-text-primary, #202225);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 32px;
}

.relation-type {
  font-size: 0.72rem;
  font-weight: 500;
  white-space: nowrap;
}

.mini-badge {
  display: inline-flex;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 0.62rem;
  font-weight: 500;
  line-height: 1.5;
}

.mini-badge.confirmed {
  background-color: rgba(90, 154, 143, 0.1);
  color: var(--og-safe, #5A9A8F);
}

.mini-badge.inferred {
  background-color: rgba(200, 159, 94, 0.1);
  color: var(--og-warning, #C89F5E);
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
