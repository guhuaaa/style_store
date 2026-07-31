<template>
  <aside class="filter-panel" :class="{ collapsed }">
    <div class="panel-header">
      <h3 class="panel-title">分析控制</h3>
      <button class="collapse-btn" @click="emit('toggle-collapse')">
        <el-icon size="14"><Fold v-if="!collapsed" /><Expand v-else /></el-icon>
      </button>
    </div>

    <div v-show="!collapsed" class="panel-body">
      <div class="section">
        <div class="section-title">事件摘要</div>
        <p class="event-summary">{{ overview.summary || '暂无事件摘要。上传材料并完成分析后，系统将生成舆情事件摘要。' }}</p>
      </div>

      <div class="section">
        <div class="section-title">主体类型</div>
        <div class="chip-group">
          <button
            v-for="type in entityTypeList"
            :key="type.key"
            class="chip"
            :class="{ active: selectedEntityTypes.includes(type.key) }"
            :style="{ '--chip-color': type.color }"
            @click="toggleEntityType(type.key)"
          >
            <span class="chip-dot"></span>
            <span>{{ type.label }}</span>
            <small>{{ type.count }}</small>
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">关系类型</div>
        <div class="chip-group">
          <button
            v-for="type in relationTypeList"
            :key="type.key"
            class="chip relation-chip"
            :class="{ active: selectedRelationTypes.includes(type.key) }"
            :style="{ '--chip-color': type.color }"
            @click="toggleRelationType(type.key)"
          >
            <span class="chip-line"></span>
            <span>{{ type.label }}</span>
            <small>{{ type.count }}</small>
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">立场</div>
        <div class="chip-group">
          <button
            v-for="stance in stanceList"
            :key="stance.key"
            class="chip"
            :class="{ active: selectedStances.includes(stance.key) }"
            :style="{ '--chip-color': stance.color }"
            @click="toggleStance(stance.key)"
          >
            {{ stance.label }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">关系强度 ≥ {{ minStrength }}</div>
        <el-slider v-model="minStrength" :min="0" :max="10" :step="0.5" show-stops size="small" />
      </div>

      <div class="section switch-section">
        <span>仅显示核心主体</span>
        <el-switch v-model="keyOnly" size="small" />
      </div>

      <div class="section switch-section">
        <span>隐藏推测关系</span>
        <el-switch v-model="hideInferred" size="small" />
      </div>

      <div class="section">
        <div class="section-title">布局模式</div>
        <el-radio-group v-model="localLayoutMode" size="small">
          <el-radio-button label="force">关系网络</el-radio-button>
          <el-radio-button label="dagre">传播层级</el-radio-button>
          <el-radio-button label="radial">径向扩散</el-radio-button>
          <el-radio-button label="grid">网格审阅</el-radio-button>
        </el-radio-group>
      </div>

      <div class="section footer-actions">
        <el-button size="small" :disabled="!hasFilters" @click="reset">清除筛选</el-button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { Expand, Fold } from '@element-plus/icons-vue'
import { entityTypes, relationTypes, stanceTypes } from '../../config/opinionGraph.js'

const props = defineProps({
  collapsed: { type: Boolean, default: false },
  overview: { type: Object, default: () => ({}) },
  entities: { type: Array, default: () => [] },
  relationships: { type: Array, default: () => [] },
  modelValue: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['update:modelValue', 'toggle-collapse'])

const entityTypeList = computed(() => {
  const counts = new Map()
  props.entities.forEach(e => {
    counts.set(e.type, (counts.get(e.type) || 0) + 1)
  })
  return Object.entries(entityTypes)
    .filter(([key]) => counts.has(key) && key !== 'other')
    .map(([key, config]) => ({ key, ...config, count: counts.get(key) || 0 }))
    .sort((a, b) => b.count - a.count)
})

const relationTypeList = computed(() => {
  const counts = new Map()
  props.relationships.forEach(r => {
    counts.set(r.type, (counts.get(r.type) || 0) + 1)
  })
  return Object.entries(relationTypes)
    .filter(([key]) => counts.has(key) && key !== 'neutral')
    .map(([key, config]) => ({ key, ...config, count: counts.get(key) || 0 }))
    .sort((a, b) => b.count - a.count)
})

const stanceList = computed(() => Object.entries(stanceTypes).map(([key, config]) => ({ key, ...config })))

const selectedEntityTypes = ref(props.modelValue.entityTypes || [])
const selectedRelationTypes = ref(props.modelValue.relationTypes || [])
const selectedStances = ref(props.modelValue.stances || [])
const minStrength = ref(props.modelValue.minStrength || 0)
const keyOnly = ref(props.modelValue.keyOnly || false)
const hideInferred = ref(props.modelValue.hideInferred || false)
const localLayoutMode = ref(props.modelValue.layoutMode || 'force')

watch(() => props.modelValue, (val) => {
  selectedEntityTypes.value = val.entityTypes || []
  selectedRelationTypes.value = val.relationTypes || []
  selectedStances.value = val.stances || []
  minStrength.value = val.minStrength || 0
  keyOnly.value = val.keyOnly || false
  hideInferred.value = val.hideInferred || false
  localLayoutMode.value = val.layoutMode || 'force'
}, { deep: true })

const hasFilters = computed(() =>
  selectedEntityTypes.value.length > 0 ||
  selectedRelationTypes.value.length > 0 ||
  selectedStances.value.length > 0 ||
  minStrength.value > 0 ||
  keyOnly.value ||
  hideInferred.value
)

function emitUpdate() {
  emit('update:modelValue', {
    entityTypes: selectedEntityTypes.value,
    relationTypes: selectedRelationTypes.value,
    stances: selectedStances.value,
    minStrength: minStrength.value,
    keyOnly: keyOnly.value,
    hideInferred: hideInferred.value,
    layoutMode: localLayoutMode.value
  })
}

function toggleEntityType(key) {
  const set = new Set(selectedEntityTypes.value)
  if (set.has(key)) set.delete(key)
  else set.add(key)
  selectedEntityTypes.value = [...set]
  emitUpdate()
}

function toggleRelationType(key) {
  const set = new Set(selectedRelationTypes.value)
  if (set.has(key)) set.delete(key)
  else set.add(key)
  selectedRelationTypes.value = [...set]
  emitUpdate()
}

function toggleStance(key) {
  const set = new Set(selectedStances.value)
  if (set.has(key)) set.delete(key)
  else set.add(key)
  selectedStances.value = [...set]
  emitUpdate()
}

function reset() {
  selectedEntityTypes.value = []
  selectedRelationTypes.value = []
  selectedStances.value = []
  minStrength.value = 0
  keyOnly.value = false
  hideInferred.value = false
  emitUpdate()
}

watch([selectedEntityTypes, selectedRelationTypes, selectedStances, minStrength, keyOnly, hideInferred, localLayoutMode], emitUpdate, { deep: true })
</script>

<style scoped>
.filter-panel {
  width: 280px;
  flex-shrink: 0;
  background-color: var(--og-surface, #fff);
  border-right: 1px solid var(--og-border, #E3E1DC);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
}

.filter-panel.collapsed {
  width: 44px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 14px;
  border-bottom: 1px solid var(--og-border, #E3E1DC);
}

.panel-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--og-text-primary, #202225);
  margin: 0;
}

.collapse-btn {
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
  transition: all 0.2s;
}

.collapse-btn:hover {
  border-color: var(--og-primary, #4056A1);
  color: var(--og-primary, #4056A1);
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.section {
  margin-bottom: 18px;
}

.section-title {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--og-text-secondary, #5A5852);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 10px;
}

.event-summary {
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--og-text-secondary, #5A5852);
  margin: 0;
}

.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border: 1px solid var(--og-border, #E3E1DC);
  border-radius: 999px;
  background-color: var(--og-surface-elevated, #FAFAF8);
  color: var(--og-text-secondary, #5A5852);
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.18s ease;
}

.chip:hover {
  background-color: var(--og-surface-hover, #F0EEEA);
}

.chip.active {
  border-color: var(--chip-color);
  background-color: color-mix(in srgb, var(--chip-color) 10%, #fff);
  color: var(--og-text-primary, #202225);
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--chip-color);
}

.chip-line {
  width: 10px;
  height: 2px;
  border-radius: 1px;
  background-color: var(--chip-color);
}

.chip small {
  color: var(--og-text-muted, #73716C);
  font-size: 0.68rem;
}

.switch-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--og-text-secondary, #5A5852);
}

.footer-actions {
  padding-top: 10px;
  border-top: 1px solid var(--og-border, #E3E1DC);
}

@media (max-width: 1100px) {
  .filter-panel {
    position: absolute;
    left: 0;
    top: 56px;
    bottom: 0;
    z-index: 50;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.06);
  }
  .filter-panel.collapsed {
    box-shadow: none;
  }
}
</style>
