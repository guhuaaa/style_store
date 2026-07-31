<template>
  <aside class="insight-panel" :class="{ drawer: isDrawer, open: isDrawer && drawerOpen }">
    <div v-if="isDrawer" class="drawer-handle" @click="drawerOpen = !drawerOpen">
      <el-icon size="16"><ArrowLeft v-if="drawerOpen" /><ArrowRight v-else /></el-icon>
      <span>洞察</span>
    </div>

    <div class="panel-inner">
      <div v-if="selectedRelation" class="panel-view">
        <RelationDetail :relation="selectedRelation" @close="emit('close-relation')" />
      </div>
      <div v-else-if="selectedEntity" class="panel-view">
        <EntityDetail
          :entity="selectedEntity"
          :relationships="relationships"
          :entity-by-id="entityById"
          :selected-relation-id="selectedRelation?.id"
          @close="emit('close-entity')"
          @select-relation="emit('select-relation', $event)"
        />
      </div>
      <div v-else class="panel-view overview">
        <div class="panel-header">
          <h3 class="panel-title">事件洞察</h3>
        </div>
        <div class="panel-body">
          <div v-if="overview.summary" class="overview-summary">
            <p>{{ overview.summary }}</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-value">{{ overview.entityCount }}</span>
              <span class="stat-label">主体</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ overview.relationshipCount }}</span>
              <span class="stat-label">关系</span>
            </div>
            <div class="stat-card">
              <span class="stat-value">{{ overview.campCount }}</span>
              <span class="stat-label">阵营</span>
            </div>
            <div class="stat-card sentiment-card" :style="{ borderColor: overview.overallSentimentColor }">
              <span class="stat-value" :style="{ color: overview.overallSentimentColor }">{{ overview.overallSentimentLabel }}</span>
              <span class="stat-label">整体倾向</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">核心主体</div>
            <div class="entity-rank">
              <div
                v-for="(entity, idx) in overview.keyEntities"
                :key="entity.uuid"
                class="rank-item"
                @click="emit('select-entity', entity)"
              >
                <span class="rank-index">{{ idx + 1 }}</span>
                <span class="rank-name">{{ entity.name }}</span>
                <span class="rank-role">{{ entity.networkRoleLabel }}</span>
              </div>
            </div>
            <div v-if="!overview.keyEntities?.length" class="empty-tip">暂无核心主体数据</div>
          </div>

          <div v-if="overview.camps?.length" class="section">
            <div class="section-title">阵营分布</div>
            <div class="camp-list">
              <div v-for="camp in overview.camps" :key="camp.key || camp.name" class="camp-item">
                <div class="camp-header">
                  <strong>{{ camp.name }}</strong>
                  <span>{{ camp.entityCount }} 个主体</span>
                </div>
                <div class="camp-stance">立场：{{ camp.stanceSummary }}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">关系类型分布</div>
            <div class="relation-bars">
              <div v-for="item in relationDistribution" :key="item.key" class="bar-row">
                <span class="bar-label">{{ item.label }}</span>
                <div class="bar-track">
                  <div class="bar-fill" :style="{ width: `${item.percent}%`, backgroundColor: item.color }"></div>
                </div>
                <span class="bar-value">{{ item.count }}</span>
              </div>
            </div>
            <div v-if="!relationDistribution.length" class="empty-tip">暂无关系数据</div>
          </div>

          <div v-if="controversies.length" class="section">
            <div class="section-title">争议焦点</div>
            <div class="controversy-list">
              <div v-for="(item, idx) in controversies" :key="idx" class="controversy-item">
                <span class="controversy-index">{{ idx + 1 }}</span>
                <span class="controversy-text">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import EntityDetail from './EntityDetail.vue'
import RelationDetail from './RelationDetail.vue'
import { relationTypes } from '../../config/opinionGraph.js'

const props = defineProps({
  overview: { type: Object, default: () => ({}) },
  entities: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  entityById: { type: Map, default: () => new Map() },
  selectedEntity: { type: Object, default: null },
  selectedRelation: { type: Object, default: null },
  isDrawer: { type: Boolean, default: false }
})

const emit = defineEmits(['select-entity', 'select-relation', 'close-entity', 'close-relation'])

const drawerOpen = ref(false)

const relationDistribution = computed(() => {
  const counts = new Map()
  props.relationships.forEach(r => {
    counts.set(r.type, (counts.get(r.type) || 0) + 1)
  })
  const total = props.relationships.length || 1
  return Object.entries(relationTypes)
    .filter(([key]) => counts.has(key))
    .map(([key, config]) => ({
      key,
      label: config.label,
      color: config.color,
      count: counts.get(key) || 0,
      percent: ((counts.get(key) || 0) / total) * 100
    }))
    .sort((a, b) => b.count - a.count)
})

const controversies = computed(() => {
  return props.overview.controversies?.length
    ? props.overview.controversies
    : props.entities.filter(e => e.networkRole === 'controversy').slice(0, 3)
})
</script>

<style scoped>
.insight-panel {
  width: 340px;
  flex-shrink: 0;
  background-color: var(--og-surface, #fff);
  border-left: 1px solid var(--og-border, #E3E1DC);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.insight-panel.drawer {
  position: absolute;
  right: 0;
  top: 56px;
  bottom: 0;
  width: 320px;
  transform: translateX(100%);
  transition: transform 0.25s ease;
  z-index: 50;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.06);
}

.insight-panel.drawer.open {
  transform: translateX(0);
}

.drawer-handle {
  position: absolute;
  left: -36px;
  top: 16px;
  width: 36px;
  padding: 8px 4px;
  background-color: var(--og-surface, #fff);
  border: 1px solid var(--og-border, #E3E1DC);
  border-right: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 0.65rem;
  color: var(--og-text-secondary, #5A5852);
  cursor: pointer;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.05);
}

.panel-inner {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-view {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-view.overview {
  overflow: hidden;
}

.panel-header {
  flex-shrink: 0;
  padding: 16px;
  border-bottom: 1px solid var(--og-border, #E3E1DC);
}

.panel-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--og-text-primary, #202225);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.overview-summary {
  padding: 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-radius: 10px;
  margin-bottom: 16px;
}

.overview-summary p {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.65;
  color: var(--og-text-secondary, #5A5852);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 4px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-radius: 10px;
  border: 1px solid var(--og-border, #E3E1DC);
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--og-text-primary, #202225);
}

.stat-label {
  font-size: 0.65rem;
  color: var(--og-text-muted, #73716C);
}

.sentiment-card {
  border-width: 1px;
}

.section {
  margin-bottom: 18px;
}

.section-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--og-text-muted, #73716C);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.entity-rank {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rank-item {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 8px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.18s;
}

.rank-item:hover {
  border-color: var(--og-primary, #4056A1);
  background-color: rgba(64, 86, 161, 0.04);
}

.rank-index {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--og-border, #E3E1DC);
  color: var(--og-text-secondary, #5A5852);
  font-size: 0.65rem;
  font-weight: 600;
}

.rank-name {
  color: var(--og-text-primary, #202225);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-role {
  color: var(--og-text-muted, #73716C);
  font-size: 0.68rem;
  white-space: nowrap;
}

.camp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.camp-item {
  padding: 10px 12px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 8px;
}

.camp-header {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.camp-header strong {
  color: var(--og-text-primary, #202225);
}

.camp-header span {
  color: var(--og-text-muted, #73716C);
  font-size: 0.7rem;
}

.camp-stance {
  font-size: 0.72rem;
  color: var(--og-text-secondary, #5A5852);
}

.relation-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-row {
  display: grid;
  grid-template-columns: 72px 1fr 28px;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
}

.bar-label {
  color: var(--og-text-secondary, #5A5852);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  transition: width 0.4s ease;
}

.bar-value {
  color: var(--og-text-muted, #73716C);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.controversy-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.controversy-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background-color: rgba(199, 92, 92, 0.06);
  border: 1px solid rgba(199, 92, 92, 0.15);
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--og-text-primary, #202225);
}

.controversy-index {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: rgba(199, 92, 92, 0.12);
  color: #C75C5C;
  font-size: 0.65rem;
  font-weight: 600;
  flex-shrink: 0;
}

.empty-tip {
  font-size: 0.78rem;
  color: var(--og-text-muted, #73716C);
  padding: 12px;
  text-align: center;
  background-color: var(--og-surface-elevated, #FAFAF8);
  border-radius: 8px;
}

@media (max-width: 1100px) {
  .insight-panel:not(.drawer) {
    width: 280px;
  }
}
</style>
