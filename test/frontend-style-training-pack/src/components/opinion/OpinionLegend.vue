<template>
  <div class="opinion-legend" :class="{ expanded }">
    <button class="legend-toggle" @click="expanded = !expanded">
      <span class="legend-title">图例</span>
      <el-icon size="12"><ArrowUp v-if="expanded" /><ArrowDown v-else /></el-icon>
    </button>

    <div v-show="expanded" class="legend-body">
      <div class="legend-section">
        <div class="section-title">主体类型</div>
        <div class="legend-list">
          <div v-for="item in entityLegendItems" :key="item.key" class="legend-item">
            <span class="legend-symbol" :class="`shape-${item.shape}`" :style="{ '--symbol-color': item.color }"></span>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-count">{{ item.count }}</span>
          </div>
        </div>
      </div>

      <div class="legend-section">
        <div class="section-title">关系类型</div>
        <div class="legend-list">
          <div v-for="item in relationLegendItems" :key="item.key" class="legend-item relation-item">
            <span class="legend-line" :style="{ '--line-color': item.color, '--line-dashed': item.dashed ? '4 2' : '0' }"></span>
            <span class="legend-label">{{ item.label }}</span>
          </div>
        </div>
      </div>

      <div class="legend-section">
        <div class="section-title">视觉说明</div>
        <div class="guide-list">
          <div class="guide-item"><span class="guide-dot size-small"></span><span>节点大小代表连接数</span></div>
          <div class="guide-item"><span class="guide-dot size-large"></span><span>核心事件通常更大</span></div>
          <div class="guide-item"><span class="guide-line dashed"></span><span>虚线表示推测关系</span></div>
          <div class="guide-item"><span class="guide-line arrow"></span><span>箭头表示关系方向</span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { entityTypes, relationTypes } from '../../config/opinionGraph.js'

const props = defineProps({
  entities: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] }
})

const expanded = ref(false)

const entityLegendItems = computed(() => {
  const counts = new Map()
  props.entities.forEach(e => {
    counts.set(e.type, (counts.get(e.type) || 0) + 1)
  })
  return Object.entries(entityTypes)
    .filter(([key]) => counts.has(key) && key !== 'other')
    .map(([key, config]) => ({ key, ...config, count: counts.get(key) || 0 }))
    .sort((a, b) => b.count - a.count)
})

const relationLegendItems = computed(() => {
  const counts = new Map()
  props.relationships.forEach(r => {
    counts.set(r.type, (counts.get(r.type) || 0) + 1)
  })
  return Object.entries(relationTypes)
    .filter(([key]) => counts.has(key))
    .map(([key, config]) => ({ key, ...config, dashed: config.dashed || false }))
    .sort((a, b) => (counts.get(b.key) || 0) - (counts.get(a.key) || 0))
})
</script>

<style scoped>
.opinion-legend {
  position: absolute;
  left: 16px;
  bottom: 16px;
  min-width: 160px;
  max-width: 240px;
  background-color: var(--og-surface, #fff);
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  z-index: 10;
  overflow: hidden;
}

.legend-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: none;
  background: transparent;
  color: var(--og-text-secondary, #5A5852);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.legend-toggle:hover {
  background-color: var(--og-surface-hover, #F0EEEA);
}

.legend-title {
  color: var(--og-text-primary, #202225);
}

.legend-body {
  padding: 0 12px 12px;
  max-height: 320px;
  overflow-y: auto;
}

.legend-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--og-border, #E3E1DC);
}

.legend-section:first-child {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}

.section-title {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--og-text-muted, #73716C);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: grid;
  grid-template-columns: 20px 1fr auto;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  color: var(--og-text-secondary, #5A5852);
}

.legend-symbol {
  width: 12px;
  height: 12px;
  background-color: var(--symbol-color);
}

.shape-circle,
.shape-ring,
.shape-circleSmall {
  border-radius: 50%;
}

.shape-ring {
  box-shadow: 0 0 0 2px var(--og-surface, #fff), 0 0 0 3px var(--symbol-color);
}

.shape-roundedSquare,
.shape-square {
  border-radius: 3px;
}

.shape-diamond {
  transform: rotate(45deg) scale(0.8);
  border-radius: 2px;
}

.shape-hexagon {
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}

.shape-cluster {
  border-radius: 50%;
  box-shadow: 4px 0 0 var(--symbol-color), -4px 0 0 var(--symbol-color);
  background: transparent;
}

.shape-core {
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--symbol-color), 0 0 0 4px rgba(0,0,0,0.06);
}

.legend-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-count {
  color: var(--og-text-muted, #73716C);
  font-variant-numeric: tabular-nums;
}

.relation-item {
  grid-template-columns: 20px 1fr;
}

.legend-line {
  height: 2px;
  border-radius: 1px;
  background-color: var(--line-color);
  border-bottom: 1px dashed var(--line-color);
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  color: var(--og-text-muted, #73716C);
}

.guide-dot {
  border-radius: 50%;
  background-color: var(--og-text-muted, #73716C);
  flex-shrink: 0;
}

.guide-dot.size-small {
  width: 6px;
  height: 6px;
}

.guide-dot.size-large {
  width: 10px;
  height: 10px;
}

.guide-line {
  width: 16px;
  height: 2px;
  background-color: var(--og-text-muted, #73716C);
  flex-shrink: 0;
  position: relative;
}

.guide-line.dashed {
  background: repeating-linear-gradient(90deg, var(--og-text-muted, #73716C), var(--og-text-muted, #73716C) 3px, transparent 3px, transparent 6px);
}

.guide-line.arrow::after {
  content: '';
  position: absolute;
  right: -1px;
  top: -2px;
  border: 3px solid transparent;
  border-left-color: var(--og-text-muted, #73716C);
}
</style>
