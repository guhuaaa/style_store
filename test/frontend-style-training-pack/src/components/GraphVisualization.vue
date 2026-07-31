<template>
  <div class="graph-workspace" :class="{ 'panel-open': selectedEntity || selectedRelation }">
    <GraphToolbar
      :overview="overview"
      :entity-count="displayEntities.length"
      :relationship-count="displayRelationships.length"
      :loading="loading || graphBusy"
      :status="graphStatus"
      :update-time="updateTime"
      :search-keyword="searchKeyword"
      :show-back="showBack"
      @refresh="$emit('refresh')"
      @fit="fitToScreen"
      @export="exportMenuOpen = !exportMenuOpen"
      @search="handleSearch"
      @back="$emit('back-to-workflow')"
    />

    <div class="workspace-body">
      <EntityFilterPanel
        v-model="filters"
        :collapsed="filterCollapsed"
        :overview="overview"
        :entities="entities"
        :relationships="relationships"
        @toggle-collapse="filterCollapsed = !filterCollapsed"
      />

      <div ref="stageShell" class="graph-stage-area">
        <div
          ref="graphCanvas"
          class="graph-stage"
          role="application"
          tabindex="0"
          aria-label="G6 舆情主体关系图谱。可拖拽和缩放，点击查看详情，双击节点展开两层邻居，按住 Shift 拖拽可框选。"
        ></div>

        <div v-if="displayEntities.length" class="graph-mode-badge" aria-hidden="true">
          <span class="mode-dot"></span>
          G6 Canvas · {{ layoutLabel }}
          <span v-if="renderMetrics.renderMs">· {{ renderMetrics.renderMs.toFixed(0) }} ms</span>
        </div>

        <div v-if="largeGraphTruncated" class="large-graph-notice" role="status">
          大图降级：优先展示 500 个关键主体，隐藏关系标签并启用紧凑节点
        </div>

        <div v-if="neighborBusy" class="neighbor-notice" role="status">
          正在展开两层邻居…
        </div>

        <div v-if="displayEntities.length" class="zoom-controls" aria-label="图谱视图控制">
          <button type="button" aria-label="放大图谱" title="放大" @click="zoomBy(1.25)">+</button>
          <button type="button" aria-label="缩小图谱" title="缩小" @click="zoomBy(0.8)">−</button>
          <button type="button" aria-label="适配全部节点" title="适配全部节点" @click="fitToScreen">全</button>
          <button type="button" aria-label="切换全屏" title="切换全屏" @click="toggleFullscreen">
            {{ fullscreen ? '退' : '屏' }}
          </button>
        </div>

        <div v-if="exportMenuOpen" class="export-menu">
          <button type="button" :disabled="exporting" @click="exportPngFile">
            {{ exporting ? '生成中…' : '导出 PNG（2x）' }}
          </button>
          <button type="button" @click="exportJsonFile">导出 JSON</button>
        </div>

        <OpinionLegend :entities="displayEntities" :relationships="displayRelationships" />

        <div v-if="loading && !entities.length" class="loading-state" role="status" aria-live="polite">
          <span class="loading-ring"></span>
          <p>正在生成关系图谱…</p>
        </div>

        <div v-if="!entities.length && !loading" class="empty-state">
          <el-icon size="48" color="#B0ADA6"><Share /></el-icon>
          <p>暂无图谱数据</p>
          <p class="empty-hint">上传可解析材料并完成风险图谱构建后，主体关系会显示在这里。</p>
        </div>

        <div v-if="entities.length && !displayEntities.length" class="empty-state">
          <el-icon size="40" color="#B0ADA6"><Filter /></el-icon>
          <p>筛选后无匹配数据</p>
          <p class="empty-hint">请尝试放宽筛选条件</p>
        </div>
      </div>

      <InsightPanel
        :is-drawer="isNarrow"
        :overview="overview"
        :entities="entities"
        :relationships="relationships"
        :entity-by-id="entityById"
        :selected-entity="selectedEntity"
        :selected-relation="selectedRelation"
        @select-entity="selectEntity"
        @select-relation="selectRelation"
        @close-entity="clearSelection"
        @close-relation="clearSelection"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Filter, Share } from '@element-plus/icons-vue'
import GraphToolbar from './opinion/GraphToolbar.vue'
import EntityFilterPanel from './opinion/EntityFilterPanel.vue'
import InsightPanel from './opinion/InsightPanel.vue'
import OpinionLegend from './opinion/OpinionLegend.vue'
import { getGraphNeighbors } from '../api/graph.js'
import { useG6Graph, toG6Data } from '../composables/useG6Graph.js'
import { useGraphNormalization } from '../composables/useGraphNormalization.js'

const props = defineProps({
  graphData: { type: Object, default: () => null },
  loading: { type: Boolean, default: false },
  status: { type: String, default: 'idle' },
  showBack: { type: Boolean, default: false }
})

defineEmits(['refresh', 'back-to-workflow'])
defineExpose({ focusEvidence })

const stageShell = ref(null)
const graphCanvas = ref(null)
const filterCollapsed = ref(false)
const isNarrow = ref(false)
const fullscreen = ref(false)
const searchKeyword = ref('')
const selectedEntity = ref(null)
const selectedRelation = ref(null)
const exportMenuOpen = ref(false)
const exporting = ref(false)
const graphBusy = ref(false)
const neighborBusy = ref(false)
const hiddenEntityIds = ref(new Set())
const neighborModeIds = ref(null)
const extraRawNodes = ref([])
const extraRawEdges = ref([])
const renderMetrics = ref({ renderMs: 0, nodeCount: 0, edgeCount: 0 })

const filters = ref({
  entityTypes: [],
  relationTypes: [],
  stances: [],
  minStrength: 0,
  keyOnly: false,
  hideInferred: false,
  layoutMode: 'force'
})

const {
  create,
  destroy,
  focus,
  fit,
  zoomBy: graphZoomBy,
  exportPng
} = useG6Graph()

function resolvePayload(value) {
  let current = value || {}
  for (let index = 0; index < 5; index += 1) {
    if (!current || typeof current !== 'object') return {}
    if (
      current.entities !== undefined ||
      current.relationships !== undefined ||
      current.nodes !== undefined ||
      current.edges !== undefined
    ) return current
    current = current.data
  }
  return {}
}

function uniqueBy(items, keyOf) {
  const result = new Map()
  items.forEach((item) => {
    const key = keyOf(item)
    if (key) result.set(String(key), item)
  })
  return [...result.values()]
}

const augmentedGraphData = computed(() => {
  const payload = resolvePayload(props.graphData)
  const rawNodes = Array.isArray(payload.entities) ? payload.entities : (payload.nodes || [])
  const rawEdges = Array.isArray(payload.relationships) ? payload.relationships : (payload.edges || [])
  return {
    ...payload,
    entities: undefined,
    relationships: undefined,
    nodes: uniqueBy([...rawNodes, ...extraRawNodes.value], item =>
      item?.uuid || item?.uuid_ || item?.id || item?.node_id || item?.name
    ),
    edges: uniqueBy([...rawEdges, ...extraRawEdges.value], item =>
      item?.uuid || item?.id || `${item?.source_node_uuid || item?.source}->${item?.target_node_uuid || item?.target}:${item?.name || item?.type || ''}`
    )
  }
})

const { entities, entityById, relationships, overview } = useGraphNormalization(augmentedGraphData)

const graphId = computed(() => {
  const payload = resolvePayload(props.graphData)
  return payload.graph_id || payload.graphId || ''
})

const graphStatus = computed(() => {
  if (props.loading || graphBusy.value) return 'loading'
  if (props.status === 'error') return 'error'
  return entities.value.length ? 'success' : 'idle'
})

const updateTime = computed(() => new Date().toLocaleString('zh-CN', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}))

const keyEntityIds = computed(() => new Set(
  entities.value
    .slice()
    .sort((a, b) => (b.influence || 0) + b.degree - ((a.influence || 0) + a.degree))
    .slice(0, 10)
    .map(entity => entity.uuid)
))

const searchMatchedIds = computed(() => {
  const keyword = searchKeyword.value.trim().toLowerCase()
  if (!keyword) return null
  return new Set(entities.value.filter((entity) =>
    `${entity.name} ${entity.typeLabel} ${entity.description}`.toLowerCase().includes(keyword)
  ).map(entity => entity.uuid))
})

const filteredEntities = computed(() => {
  let list = entities.value.filter(entity => !hiddenEntityIds.value.has(entity.uuid))
  if (filters.value.entityTypes.length) {
    list = list.filter(entity => filters.value.entityTypes.includes(entity.type))
  }
  if (filters.value.stances.length) {
    list = list.filter(entity => filters.value.stances.includes(entity.stance))
  }
  if (filters.value.keyOnly) list = list.filter(entity => keyEntityIds.value.has(entity.uuid))
  if (searchMatchedIds.value) list = list.filter(entity => searchMatchedIds.value.has(entity.uuid))
  if (neighborModeIds.value) list = list.filter(entity => neighborModeIds.value.has(entity.uuid))
  return list
})

const largeGraphTruncated = computed(() => !neighborModeIds.value && filteredEntities.value.length > 500)

const displayEntities = computed(() => {
  if (!largeGraphTruncated.value) return filteredEntities.value
  return filteredEntities.value
    .slice()
    .sort((a, b) => ((b.influence || 0) + b.degree * 2) - ((a.influence || 0) + a.degree * 2))
    .slice(0, 500)
})

const displayEntityIds = computed(() => new Set(displayEntities.value.map(entity => entity.uuid)))

const displayRelationships = computed(() => relationships.value.filter((relation) => {
  if (!displayEntityIds.value.has(relation.source) || !displayEntityIds.value.has(relation.target)) return false
  if (filters.value.relationTypes.length && !filters.value.relationTypes.includes(relation.type)) return false
  if (relation.weight < filters.value.minStrength) return false
  return !(filters.value.hideInferred && relation.inferred)
}))

function toPropagationDag(relations) {
  const directed = relations.filter(relation => relation.directed)
  const candidates = (directed.length ? directed : relations)
    .slice()
    .sort((a, b) => {
      const timeCompare = String(a.firstTime || '').localeCompare(String(b.firstTime || ''))
      return timeCompare || String(a.id).localeCompare(String(b.id))
    })
  const adjacency = new Map()

  function hasPath(start, target) {
    const stack = [start]
    const visited = new Set()
    while (stack.length) {
      const current = stack.pop()
      if (current === target) return true
      if (visited.has(current)) continue
      visited.add(current)
      for (const next of adjacency.get(current) || []) stack.push(next)
    }
    return false
  }

  const accepted = []
  candidates.forEach((relation) => {
    if (!relation.source || !relation.target || relation.source === relation.target) return
    if (hasPath(relation.target, relation.source)) return
    if (!adjacency.has(relation.source)) adjacency.set(relation.source, new Set())
    adjacency.get(relation.source).add(relation.target)
    accepted.push({
      ...relation,
      algorithmInferred: true,
      inferenceLabel: '传播层级为算法推断，可回溯原始关系证据'
    })
  })
  return accepted
}

const layoutRelationships = computed(() =>
  filters.value.layoutMode === 'dagre'
    ? toPropagationDag(displayRelationships.value)
    : displayRelationships.value
)

const layoutLabel = computed(() => ({
  force: '关系网络',
  dagre: '传播层级',
  radial: '径向扩散',
  grid: '网格审阅'
})[filters.value.layoutMode] || '关系网络')

const graphSignature = computed(() => [
  filters.value.layoutMode,
  displayEntities.value.map(entity => entity.uuid).sort().join(','),
  layoutRelationships.value.map(relation => relation.id).sort().join(',')
].join('|'))

let renderGeneration = 0

async function renderGraph() {
  const generation = ++renderGeneration
  await nextTick()
  if (!graphCanvas.value) return
  if (!displayEntities.value.length) {
    destroy()
    return
  }
  graphBusy.value = true
  const data = toG6Data(displayEntities.value, layoutRelationships.value)
  try {
    await create(graphCanvas.value, data, {
      layoutMode: filters.value.layoutMode,
      showTimebar: displayEntities.value.some(entity => entity.firstTime || entity.created_at),
      onRendered: metrics => {
        if (generation === renderGeneration) renderMetrics.value = metrics
      },
      onNodeClick: selectEntityById,
      onNodeDoubleClick: expandNeighbors,
      onEdgeClick: selectRelationById,
      onCanvasClick: clearSelection,
      onContextAction: handleContextAction
    })
  } catch (error) {
    if (generation === renderGeneration) {
      console.error('G6 graph render failed', error)
      ElMessage.error(`图谱渲染失败：${error.message}`)
    }
  } finally {
    if (generation === renderGeneration) graphBusy.value = false
  }
}

function clearSelection() {
  selectedEntity.value = null
  selectedRelation.value = null
}

function selectEntityById(id) {
  const entity = entities.value.find(item => item.uuid === String(id))
  if (entity) selectEntity(entity, false)
}

function selectRelationById(id) {
  const relation = relationships.value.find(item => String(item.id) === String(id))
  if (relation) selectRelation(relation)
}

function selectEntity(entity, moveView = true) {
  const fresh = entities.value.find(item => item.uuid === entity.uuid) || entity
  selectedRelation.value = null
  selectedEntity.value = fresh
  if (moveView) void focus(fresh.uuid)
}

function selectRelation(relation) {
  selectedEntity.value = null
  selectedRelation.value = relation
}

function collectNeighborIds(rootId, depth = 2, limit = 200) {
  const adjacency = new Map()
  relationships.value.forEach((relation) => {
    if (!adjacency.has(relation.source)) adjacency.set(relation.source, new Set())
    if (!adjacency.has(relation.target)) adjacency.set(relation.target, new Set())
    adjacency.get(relation.source).add(relation.target)
    adjacency.get(relation.target).add(relation.source)
  })
  const visited = new Set([rootId])
  let frontier = [rootId]
  for (let level = 0; level < depth && frontier.length; level += 1) {
    const next = []
    frontier.forEach((id) => {
      for (const neighbor of adjacency.get(id) || []) {
        if (visited.size >= limit) break
        if (!visited.has(neighbor)) {
          visited.add(neighbor)
          next.push(neighbor)
        }
      }
    })
    frontier = next
  }
  return visited
}

async function expandNeighbors(id) {
  const nodeId = String(id || '')
  if (!nodeId) return
  neighborBusy.value = true
  try {
    if (graphId.value) {
      const response = await getGraphNeighbors(graphId.value, nodeId, { depth: 2, limit: 200 })
      const data = response.data || {}
      extraRawNodes.value = uniqueBy(
        [...extraRawNodes.value, ...(data.nodes || [])],
        item => item?.uuid || item?.id || item?.name
      )
      extraRawEdges.value = uniqueBy(
        [...extraRawEdges.value, ...(data.edges || [])],
        item => item?.uuid || item?.id
      )
      if (data.truncated) ElMessage.info('邻居数量超过 200，已按上限展开。')
    }
    neighborModeIds.value = null
    await nextTick()
    await renderGraph()
    selectEntityById(nodeId)
    void focus(nodeId)
  } catch (error) {
    ElMessage.warning(`邻居展开失败：${error.message}`)
  } finally {
    neighborBusy.value = false
  }
}

function handleContextAction(action, id) {
  const nodeId = String(id || '')
  if (!nodeId) return
  if (action === 'focus') {
    selectEntityById(nodeId)
    void focus(nodeId)
    return
  }
  if (action === 'hide') {
    hiddenEntityIds.value = new Set([...hiddenEntityIds.value, nodeId])
    clearSelection()
    return
  }
  if (action === 'neighbors') {
    neighborModeIds.value = collectNeighborIds(nodeId, 2, 200)
    return
  }
  if (action === 'export-subgraph') {
    const ids = collectNeighborIds(nodeId, 2, 200)
    downloadJson(buildExportData(ids), `舆情子图_${nodeId}_${dateStamp()}.json`)
  }
}

function buildExportData(allowedIds = displayEntityIds.value) {
  return {
    schema_version: 'g6-opinion-graph-v1',
    graph_id: graphId.value,
    exported_at: new Date().toISOString(),
    layout: filters.value.layoutMode,
    nodes: entities.value.filter(entity => allowedIds.has(entity.uuid)),
    edges: relationships.value.filter(edge => allowedIds.has(edge.source) && allowedIds.has(edge.target))
  }
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function exportPngFile() {
  exporting.value = true
  try {
    const graphUrl = await exportPng(1)
    if (!graphUrl) return
    const url = await composeExportImage(graphUrl, 2)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `舆情关系图谱_${dateStamp()}@2x.png`
    anchor.click()
    exportMenuOpen.value = false
  } catch (error) {
    ElMessage.error(`PNG 导出失败：${error.message}`)
  } finally {
    exporting.value = false
  }
}

async function composeExportImage(graphUrl, scale = 2) {
  const image = await new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = reject
    element.src = graphUrl
  })
  const logicalWidth = Math.max(1000, image.naturalWidth)
  const headerHeight = 112
  const footerHeight = 92
  const logicalHeight = headerHeight + image.naturalHeight + footerHeight
  const canvas = document.createElement('canvas')
  canvas.width = logicalWidth * scale
  canvas.height = logicalHeight * scale
  const context = canvas.getContext('2d')
  context.scale(scale, scale)
  context.fillStyle = '#faf9f5'
  context.fillRect(0, 0, logicalWidth, logicalHeight)

  context.fillStyle = '#111111'
  context.font = '600 24px "Noto Serif SC", "Songti SC", serif'
  context.fillText(overview.value.title || '舆情关系图谱', 34, 42)
  context.fillStyle = '#73716c'
  context.font = '12px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  context.fillText(
    `${displayEntities.value.length} 个主体 · ${displayRelationships.value.length} 条关系 · ${layoutLabel.value} · ${new Date().toLocaleString('zh-CN')}`,
    34,
    70
  )
  if (filters.value.layoutMode === 'dagre') {
    context.fillStyle = '#9d7b32'
    context.fillText('传播层级为算法推断；原始关系与 evidence 保留在 JSON 导出中。', 34, 91)
  }
  context.strokeStyle = '#d8d5cc'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(34, headerHeight - 10)
  context.lineTo(logicalWidth - 34, headerHeight - 10)
  context.stroke()

  const graphX = (logicalWidth - image.naturalWidth) / 2
  context.drawImage(image, graphX, headerHeight)

  const entityLegend = uniqueBy(
    displayEntities.value.map(item => ({ key: item.type, label: item.typeLabel, color: item.typeColor })),
    item => item.key
  ).slice(0, 8)
  const relationLegend = uniqueBy(
    displayRelationships.value.map(item => ({ key: item.type, label: item.typeLabel, color: item.typeColor })),
    item => item.key
  ).slice(0, 8)
  const legendY = headerHeight + image.naturalHeight + 28
  context.fillStyle = '#202225'
  context.font = '600 12px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  context.fillText('主体', 34, legendY)
  let cursorX = 76
  context.font = '11px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  entityLegend.forEach((item) => {
    context.fillStyle = item.color || '#74716b'
    context.fillRect(cursorX, legendY - 8, 8, 8)
    context.fillStyle = '#5a5852'
    context.fillText(item.label, cursorX + 13, legendY)
    cursorX += 24 + context.measureText(item.label).width
  })

  const relationY = legendY + 34
  context.fillStyle = '#202225'
  context.font = '600 12px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  context.fillText('关系', 34, relationY)
  cursorX = 76
  context.font = '11px "Noto Sans SC", "Microsoft YaHei", sans-serif'
  relationLegend.forEach((item) => {
    context.strokeStyle = item.color || '#8e8c86'
    context.beginPath()
    context.moveTo(cursorX, relationY - 4)
    context.lineTo(cursorX + 14, relationY - 4)
    context.stroke()
    context.fillStyle = '#5a5852'
    context.fillText(item.label, cursorX + 19, relationY)
    cursorX += 32 + context.measureText(item.label).width
  })
  return canvas.toDataURL('image/png')
}

function exportJsonFile() {
  downloadJson(buildExportData(), `舆情关系图谱_${dateStamp()}.json`)
  exportMenuOpen.value = false
}

function handleSearch(keyword) {
  searchKeyword.value = String(keyword || '')
  if (!keyword) return
  const entity = entities.value.find(item => item.name.toLowerCase().includes(String(keyword).toLowerCase()))
  if (entity) {
    nextTick(() => selectEntity(entity))
  } else {
    ElMessage.info('未找到匹配主体')
  }
}

function focusEvidence(sourceType, sourceId) {
  const id = String(sourceId || '')
  if (!id) return false
  if (sourceType === 'graph_node') {
    const entity = entities.value.find(item => item.uuid === id)
    if (!entity) return false
    neighborModeIds.value = null
    hiddenEntityIds.value = new Set([...hiddenEntityIds.value].filter(item => item !== id))
    searchKeyword.value = ''
    nextTick(() => selectEntity(entity))
    return true
  }
  if (sourceType === 'graph_edge') {
    const relation = relationships.value.find(item =>
      [item.id, item.uuid, item.uuid_].map(String).includes(id)
    )
    if (!relation) return false
    neighborModeIds.value = null
    searchKeyword.value = ''
    nextTick(() => selectRelation(relation))
    return true
  }
  return false
}

function fitToScreen() {
  void fit()
}

function zoomBy(ratio) {
  void graphZoomBy(ratio)
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await stageShell.value?.requestFullscreen()
  } catch (error) {
    ElMessage.warning(`无法切换全屏：${error.message}`)
  }
}

function syncViewportState() {
  isNarrow.value = window.innerWidth < 1280
  fullscreen.value = Boolean(document.fullscreenElement)
}

watch(graphSignature, renderGraph)
watch(() => props.graphData, () => {
  extraRawNodes.value = []
  extraRawEdges.value = []
  hiddenEntityIds.value = new Set()
  neighborModeIds.value = null
}, { deep: false })

onMounted(() => {
  syncViewportState()
  window.addEventListener('resize', syncViewportState)
  document.addEventListener('fullscreenchange', syncViewportState)
  renderGraph()
})

onBeforeUnmount(() => {
  renderGeneration += 1
  window.removeEventListener('resize', syncViewportState)
  document.removeEventListener('fullscreenchange', syncViewportState)
  destroy()
})
</script>

<style scoped>
.graph-workspace {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: min(820px, calc(100vh - 142px));
  min-height: 620px;
  overflow: hidden;
  border: 1px solid var(--og-border);
  border-radius: var(--craft-radius);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--og-surface) 86%, transparent), color-mix(in srgb, var(--ui-paper) 28%, var(--og-surface))),
    var(--craft-fiber);
  box-shadow: var(--craft-shadow);
}

.workspace-body {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

.graph-stage-area {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  background-color: var(--og-surface);
  background-image:
    radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ui-sage) 18%, transparent) 0 1px, transparent 1.7px),
    linear-gradient(color-mix(in srgb, var(--ui-border) 46%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--ui-border) 46%, transparent) 1px, transparent 1px),
    var(--craft-fiber);
  background-size: 24px 24px;
}

.graph-stage-area:fullscreen {
  width: 100vw;
  height: 100vh;
  background-color: var(--og-surface);
}

.graph-stage {
  position: absolute;
  inset: 0;
  outline: none;
}

.graph-mode-badge,
.large-graph-notice,
.neighbor-notice {
  position: absolute;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: 1px solid rgba(184, 181, 174, 0.8);
  background: color-mix(in srgb, var(--og-surface) 90%, transparent);
  color: var(--og-text-muted);
  font-size: 11px;
  line-height: 1;
  backdrop-filter: blur(8px);
}

.graph-mode-badge {
  top: 14px;
  left: 14px;
  padding: 8px 10px;
}

.mode-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ui-sap);
}

.large-graph-notice {
  left: 14px;
  bottom: 18px;
  padding: 9px 12px;
  border-left: 3px solid var(--og-gold);
}

.neighbor-notice {
  top: 54px;
  left: 14px;
  padding: 8px 10px;
  color: var(--og-gold);
}

.zoom-controls {
  position: absolute;
  z-index: 10;
  top: 14px;
  right: 14px;
  display: grid;
  grid-template-columns: repeat(4, 32px);
  overflow: hidden;
  border: 1px solid var(--og-border);
  background: var(--og-surface);
  box-shadow: var(--craft-shadow-soft);
}

.zoom-controls button,
.export-menu button {
  border: 0;
  background: var(--og-surface);
  color: var(--og-text-secondary);
  cursor: pointer;
}

.zoom-controls button {
  width: 32px;
  height: 32px;
  border-right: 1px solid var(--og-border);
  font: 600 13px/1 sans-serif;
}

.zoom-controls button:last-child {
  border-right: 0;
}

.zoom-controls button:hover,
.export-menu button:hover {
  background: color-mix(in srgb, var(--ui-sage) 16%, var(--og-surface));
  color: var(--ui-sap);
}

.export-menu {
  position: absolute;
  z-index: 20;
  top: 54px;
  right: 14px;
  display: grid;
  width: 164px;
  border: 1px solid var(--og-border);
  background: var(--og-surface);
  box-shadow: 0 12px 30px rgba(32, 34, 37, 0.12);
}

.export-menu button {
  padding: 10px 12px;
  border-bottom: 1px solid var(--og-border);
  text-align: left;
  font-size: 12px;
}

.export-menu button:last-child {
  border-bottom: 0;
}

.loading-state,
.empty-state {
  position: absolute;
  z-index: 12;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background:
    var(--craft-fiber),
    color-mix(in srgb, var(--og-surface) 94%, transparent);
  color: var(--og-text-secondary);
}

.loading-ring {
  width: 26px;
  height: 26px;
  border: 2px solid var(--og-border);
  border-top-color: var(--ui-sap);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state p {
  margin: 0;
}

.empty-hint {
  max-width: 360px;
  color: var(--og-text-muted);
  font-size: 12px;
  text-align: center;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 1100px) {
  .graph-workspace {
    min-height: 560px;
  }

  .large-graph-notice {
    max-width: 60%;
    line-height: 1.45;
  }
}
</style>
