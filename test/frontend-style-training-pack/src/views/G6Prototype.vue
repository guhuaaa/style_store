<template>
  <main class="prototype-page">
    <header class="prototype-header">
      <div class="title-block">
        <div class="eyebrow-row">
          <p>G6 5.1.1 · 技术原型</p>
          <span class="load-badge">{{ loadLabel }}</span>
        </div>
        <h1>舆情关系图谱性能验证台</h1>
        <p class="lede">对比不同节点规模与布局策略，记录首屏耗时和浏览器内存。</p>
      </div>
      <div class="controls" aria-label="图谱性能测试控制">
        <button
          v-for="size in [100, 200, 500]"
          :key="size"
          class="scale-button"
          :class="{ active: nodeCount === size }"
          :aria-pressed="nodeCount === size"
          @click="renderSize(size)"
        >
          {{ size }} 节点
        </button>
        <label class="layout-control">
          <span>布局</span>
          <select v-model="layoutMode" @change="switchLayout">
            <option value="force">{{ nodeCount >= 300 ? '聚类总览' : '力导向' }}</option>
            <option value="dagre">层级</option>
            <option value="radial">径向</option>
            <option value="grid">网格</option>
          </select>
        </label>
        <button class="export-button" @click="download">导出 PNG</button>
      </div>
    </header>

    <section class="benchmark" aria-label="实时性能指标">
      <div class="metric-card">
        <span>节点</span>
        <strong>{{ nodeCount }}</strong>
      </div>
      <div class="metric-card">
        <span>关系</span>
        <strong>{{ edgeCount }}</strong>
      </div>
      <div class="metric-card metric-card--accent">
        <span>首屏耗时</span>
        <strong>{{ renderMs == null ? '测量中' : `${renderMs.toFixed(0)} ms` }}</strong>
      </div>
      <div class="metric-card">
        <span>堆内存</span>
        <strong>{{ heapMb == null ? '不可用' : `${heapMb.toFixed(1)} MB` }}</strong>
      </div>
    </section>

    <div class="benchmark-notes">
      <span><i :class="{ online: webglSupported }"></i>WebGL {{ webglSupported ? '可用，当前使用 Canvas' : '不可用' }}</span>
      <span>{{ layoutLabel }}布局</span>
      <span>Shift + 拖拽框选</span>
    </div>

    <div v-if="nodeCount >= 300" class="degradation-note">
      <strong>500 节点降级已启用</strong>
      <span>紧凑节点 · 隐藏边标签 · 预计算六群组布局</span>
    </div>

    <section class="canvas-shell">
      <div class="canvas-caption">
        <span>实时画布</span>
        <div class="canvas-caption__right">
          <span>{{ nodeCount }} 节点 / {{ edgeCount }} 关系</span>
          <div class="zoom-controls" aria-label="图谱缩放控制">
            <button aria-label="缩小图谱" title="缩小" @click="zoomBy(0.82)">−</button>
            <button class="fit-button" @click="fit">适配</button>
            <button aria-label="放大图谱" title="放大" @click="zoomBy(1.22)">+</button>
          </div>
        </div>
      </div>
      <div ref="container" class="prototype-canvas"></div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createPrototypeData, useG6Graph } from '../composables/useG6Graph'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()
const container = ref(null)
const nodeCount = ref(100)
const edgeCount = ref(0)
const renderMs = ref(null)
const heapMb = ref(null)
const layoutMode = ref('force')
const webglSupported = ref(false)
const { create, destroy, exportPng, fit, setLayout, zoomBy } = useG6Graph()
let restoreSidebarOnExit = false

const layoutLabel = computed(() => ({
  force: nodeCount.value >= 300 ? '聚类总览' : '力导向',
  dagre: '层级',
  radial: '径向',
  grid: '网格'
}[layoutMode.value] || '力导向'))

const loadLabel = computed(() => {
  if (nodeCount.value >= 500) return '压力负载'
  if (nodeCount.value >= 200) return '中等负载'
  return '常规负载'
})

async function renderSize(size) {
  nodeCount.value = size
  renderMs.value = null
  const data = createPrototypeData(size)
  edgeCount.value = data.edges.length
  await create(container.value, data, {
    layoutMode: layoutMode.value,
    showTimebar: false,
    onRendered: metrics => {
      renderMs.value = metrics.renderMs
      heapMb.value = performance.memory?.usedJSHeapSize
        ? performance.memory.usedJSHeapSize / 1024 / 1024
        : null
    }
  })
}

async function switchLayout() {
  const started = performance.now()
  await setLayout(layoutMode.value)
  renderMs.value = performance.now() - started
}

async function download() {
  const url = await exportPng()
  if (!url) return
  const link = document.createElement('a')
  link.href = url
  link.download = `g6-prototype-${nodeCount.value}.png`
  link.click()
}

onMounted(() => {
  if (window.innerWidth <= 900 && !appStore.sidebarCollapsed) {
    appStore.toggleSidebar()
    restoreSidebarOnExit = true
  }
  const canvas = document.createElement('canvas')
  webglSupported.value = Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  renderSize(100)
})

onBeforeUnmount(() => {
  destroy()
  if (restoreSidebarOnExit && appStore.sidebarCollapsed) {
    appStore.toggleSidebar()
  }
})
</script>

<style scoped>
.prototype-page {
  min-height: 100%;
  padding: clamp(14px, 2.2vw, 24px);
  box-sizing: border-box;
  background: var(--ui-paper);
  color: var(--ui-ink);
}

.prototype-header {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--ui-border);
}

.eyebrow-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 7px;
}

.eyebrow-row p {
  margin: 0;
  color: var(--ui-gold);
  font: 700 10px/1.2 'Plus Jakarta Sans', sans-serif;
  letter-spacing: .16em;
  text-transform: uppercase;
}

.load-badge {
  padding: 3px 7px;
  border: 1px solid color-mix(in srgb, var(--ui-gold) 42%, var(--ui-border));
  color: var(--ui-gold);
  font: 600 10px/1.2 'Plus Jakarta Sans', sans-serif;
  letter-spacing: .04em;
}

h1 {
  margin: 0;
  font: 650 clamp(21px, 2.4vw, 30px)/1.25 'Noto Serif SC', serif;
  letter-spacing: -.02em;
}

.lede {
  max-width: 620px;
  margin: 8px 0 0;
  color: var(--ui-graphite);
  font-size: 12px;
  line-height: 1.6;
}

.controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(78px, 1fr)) minmax(132px, 1.2fr) auto;
  gap: 7px;
}

button,
select {
  min-height: 38px;
  border: 1px solid var(--ui-border);
  background: var(--ui-surface);
  color: var(--ui-ink);
  font: 600 12px/1 'Plus Jakarta Sans', 'Microsoft YaHei', sans-serif;
}

button {
  padding: 9px 12px;
  cursor: pointer;
  transition: border-color .16s ease, color .16s ease, background-color .16s ease;
}

button:hover {
  border-color: var(--ui-gold);
}

button:focus-visible,
select:focus-visible {
  outline: 2px solid var(--ui-gold);
  outline-offset: 2px;
}

.scale-button.active {
  border-color: var(--ui-gold);
  background: color-mix(in srgb, var(--ui-gold) 12%, var(--ui-surface));
  color: var(--ui-gold);
}

.layout-control {
  position: relative;
}

.layout-control > span {
  position: absolute;
  top: 5px;
  left: 10px;
  z-index: 1;
  color: var(--ui-graphite);
  font-size: 9px;
  letter-spacing: .08em;
  pointer-events: none;
}

.layout-control select {
  width: 100%;
  height: 100%;
  padding: 15px 28px 3px 9px;
}

.export-button {
  white-space: nowrap;
}

.benchmark {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin-top: 14px;
  padding: 1px;
  background: var(--ui-border);
  border: 1px solid var(--ui-border);
}

.metric-card {
  min-width: 0;
  padding: 12px 14px;
  background: var(--ui-surface);
}

.metric-card span {
  display: block;
  margin-bottom: 5px;
  color: var(--ui-graphite);
  font-size: 10px;
  letter-spacing: .06em;
}

.metric-card strong {
  display: block;
  overflow: hidden;
  color: var(--ui-ink);
  font: 650 clamp(15px, 1.7vw, 20px)/1.15 'Plus Jakarta Sans', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-card--accent strong {
  color: var(--ui-gold);
}

.benchmark-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  padding: 9px 2px;
  color: var(--ui-graphite);
  font-size: 10px;
  line-height: 1.4;
}

.benchmark-notes span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.benchmark-notes i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ui-risk-high);
}

.benchmark-notes i.online {
  background: var(--ui-risk-low);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ui-risk-low) 13%, transparent);
}

.degradation-note {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
  padding: 9px 12px;
  border-left: 2px solid var(--ui-gold);
  background: color-mix(in srgb, var(--ui-gold) 7%, var(--ui-surface));
  color: var(--ui-graphite);
  font-size: 10px;
}

.degradation-note strong {
  color: var(--ui-gold);
  white-space: nowrap;
}

.canvas-shell {
  overflow: hidden;
  border: 1px solid var(--ui-border);
  background: var(--ui-surface);
}

.canvas-caption {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 11px;
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-graphite);
  font: 600 9px/1.3 'Plus Jakarta Sans', sans-serif;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.canvas-caption__right,
.zoom-controls {
  display: flex;
  align-items: center;
}

.canvas-caption__right {
  gap: 10px;
}

.zoom-controls {
  gap: 3px;
}

.zoom-controls button {
  min-width: 25px;
  min-height: 24px;
  padding: 3px 7px;
  font-size: 12px;
}

.zoom-controls .fit-button {
  min-width: 38px;
  font-size: 9px;
}

.prototype-canvas {
  height: clamp(520px, calc(100vh - 330px), 760px);
  min-height: 520px;
  background-color: var(--ui-surface);
  background-image:
    linear-gradient(color-mix(in srgb, var(--ui-border) 55%, transparent) 1px, transparent 1px),
    linear-gradient(90deg, color-mix(in srgb, var(--ui-border) 55%, transparent) 1px, transparent 1px);
  background-size: 24px 24px;
}

@media (max-width: 1100px) {
  .prototype-header {
    grid-template-columns: 1fr;
    align-items: start;
  }

  .controls {
    grid-template-columns: repeat(3, minmax(70px, 1fr));
    width: 100%;
  }

  .layout-control {
    grid-column: span 2;
  }
}

@media (max-width: 620px) {
  .benchmark {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .degradation-note {
    flex-direction: column;
    gap: 4px;
  }

  .prototype-canvas {
    height: 560px;
  }
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
