import { markRaw, shallowRef } from 'vue'
import {
  CanvasEvent,
  EdgeEvent,
  Graph,
  NodeEvent
} from '@antv/g6'
import { NODE_TYPE, registerOpinionCardNode } from '../components/opinion/OpinionCardNode'

const REDUCED_MOTION = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function plainClone(value) {
  return JSON.parse(JSON.stringify(value ?? null))
}

function timestamp(value, fallback) {
  const parsed = new Date(value || '').getTime()
  return Number.isFinite(parsed) ? parsed : fallback
}

export function toG6Data(entities = [], relationships = []) {
  const now = Date.now()
  return plainClone({
    nodes: entities.map((entity, index) => ({
      id: String(entity.uuid),
      type: NODE_TYPE,
      data: {
        label: entity.name,
        entityType: entity.type,
        entityTypeLabel: entity.typeLabel,
        influence: entity.influence,
        sentiment: entity.sentiment,
        stance: entity.stance,
        networkRole: entity.networkRole,
        degree: entity.degree,
        riskLevel: entity.riskLevel || (
          entity.sentiment === 'negative' && entity.degree >= 5 ? 'high' : 'low'
        ),
        firstSeenAt: entity.firstTime || entity.created_at || '',
        timestamp: timestamp(entity.firstTime || entity.created_at, now - index * 86400000),
        original: entity
      }
    })),
    edges: relationships.map((relation, index) => ({
      id: String(relation.id),
      source: String(relation.source),
      target: String(relation.target),
      data: {
        relationType: relation.type,
        relationTypeLabel: relation.typeLabel,
        weight: relation.weight,
        evidence: relation.evidence,
        fact: relation.fact,
        directed: relation.directed,
        firstSeenAt: relation.firstTime || '',
        timestamp: timestamp(relation.firstTime, now - index * 43200000),
        color: relation.typeColor,
        dashed: relation.dashed,
        original: relation
      }
    }))
  })
}

export function layoutOptions(mode = 'force', nodeCount = 0) {
  // Layout animation makes every simulation tick wait for a transition and
  // turns even a 50-node first paint into a multi-second operation. Element
  // focus/zoom still animate separately, while layout itself stays immediate.
  const animation = false
  if (mode === 'dagre' || mode === 'hierarchy') {
    return {
      type: 'antv-dagre',
      rankdir: 'LR',
      nodesep: 24,
      ranksep: 72,
      nodeSize: [112, 52],
      animation,
      animate: animation
    }
  }
  if (mode === 'radial') {
    return {
      type: 'radial',
      unitRadius: 112,
      preventOverlap: true,
      nodeSize: [112, 52],
      animation,
      animate: animation
    }
  }
  if (mode === 'grid' || mode === 'group') {
    return {
      type: 'grid',
      preventOverlap: true,
      nodeSize: [112, 52],
      condense: false,
      animation,
      animate: animation
    }
  }
  if (nodeCount >= 300) {
    return {
      type: 'preset',
      animation: false,
      animate: false
    }
  }
  return {
    type: 'force',
    preventOverlap: true,
    clustering: true,
    nodeClusterBy: 'cluster',
    clusterNodeStrength: 32,
    nodeSize: nodeCount > 120 ? [96, 42] : [112, 52],
    nodeSpacing: nodeCount > 120 ? 18 : 26,
    linkDistance: nodeCount > 200 ? 92 : nodeCount > 120 ? 108 : 122,
    nodeStrength: nodeCount > 200 ? 1100 : 1450,
    edgeStrength: 220,
    gravity: 4,
    maxIteration: nodeCount > 120 ? 110 : 220,
    minMovement: nodeCount > 120 ? 0.8 : 0.4,
    enableWorker: false,
    animation,
    animate: animation
  }
}

function tooltipContent(_event, items = []) {
  const item = items[0]
  if (!item) return ''
  if (item.source && item.target) {
    const inference = item.data?.original?.algorithmInferred
      ? '<small>传播层级为算法推断，可回溯原始关系证据</small>'
      : ''
    return `<div class="og-g6-tooltip"><strong>${item.data?.relationTypeLabel || '关系'}</strong><p>${item.data?.fact || `${item.source} → ${item.target}`}</p>${inference}</div>`
  }
  return `<div class="og-g6-tooltip"><strong>${item.data?.label || item.id}</strong><p>${item.data?.entityTypeLabel || '主体'} · 关联 ${item.data?.degree ?? 0}</p></div>`
}

function pluginOptions({
  showTimebar = false,
  onContextAction,
  compactViewport = false
} = {}, data) {
  const plugins = [
    {
      type: 'minimap',
      key: 'minimap',
      size: compactViewport ? [104, 66] : [154, 92],
      shape: 'type-stripe',
      filter: (_id, elementType) => elementType === 'node',
      containerStyle: {
        background: '#17191b',
        border: '1px solid #4d4a44',
        borderRadius: '4px',
        boxShadow: '0 8px 24px rgba(0,0,0,.24)'
      },
      maskStyle: {
        background: 'rgba(185,154,74,.10)',
        border: '1px solid #b99a4a'
      }
    },
    {
      type: 'tooltip',
      key: 'tooltip',
      enterable: true,
      getContent: tooltipContent
    },
    {
      type: 'contextmenu',
      key: 'contextmenu',
      enable: event => event.targetType === 'node',
      getItems: () => [
        { name: '聚焦此主体', value: 'focus' },
        { name: '隐藏此主体', value: 'hide' },
        { name: '仅看相邻关系', value: 'neighbors' },
        { name: '导出相关子图', value: 'export-subgraph' }
      ],
      onClick: (value, _target, current) => {
        onContextAction?.(value, current?.id || _target?.id || _target)
      }
    }
  ]
  if (data.nodes.length <= 300) {
    plugins.splice(1, 0, {
      type: 'fisheye',
      key: 'fisheye',
      trigger: 'click',
      r: 120,
      d: 1.4,
      style: {
        fill: '#9d7b32',
        fillOpacity: 0.06,
        stroke: '#9d7b32',
        lineWidth: 1
      }
    })
  }
  if (showTimebar && data.nodes.length) {
    const values = data.nodes.map(node => node.data.timestamp).sort((a, b) => a - b)
    const buckets = [...new Set(values)].slice(-12)
    plugins.push({
      type: 'timebar',
      key: 'timebar',
      data: buckets.map(time => ({ time, value: values.filter(value => value <= time).length })),
      height: 76,
      position: 'bottom',
      mode: 'visibility',
      getTime: datum => datum.data?.timestamp
    })
  }
  return plugins
}

export function useG6Graph() {
  registerOpinionCardNode()
  const graph = shallowRef(null)
  const selectedId = shallowRef('')
  let resizeObserver = null
  let callbacks = {}

  async function create(container, data, options = {}) {
    destroy()
    callbacks = options
    const nodeCount = data.nodes.length
    const compactViewport = container.clientWidth < 640
    const instance = new Graph({
      container,
      data: plainClone(data),
      autoFit: 'view',
      padding: options.showTimebar ? [24, 24, 100, 24] : 28,
      animation: false,
      layout: layoutOptions(options.layoutMode, nodeCount),
      node: {
        type: NODE_TYPE,
        style: {
          size: datum => datum.data.isCore
            ? [148, 68]
            : datum.data.isAnchor
              ? [104, 42]
            : nodeCount > 220
              ? [82, 34]
              : nodeCount > 120
                ? [96, 42]
                : [112, 52],
          compact: datum => nodeCount > 220 && !datum.data.isCore,
          core: datum => datum.data.isCore,
          radius: datum => datum.data.isCore ? 5 : 3,
          fill: datum => datum.data.isCore
            ? '#282318'
            : datum.data.isAnchor
              ? '#f5efdf'
              : '#ffffff',
          stroke: datum => datum.data.isCore
            ? '#b99a4a'
            : datum.data.isAnchor
              ? datum.data.original?.typeColor || '#9d7b32'
              : '#b8b5ae',
          lineWidth: datum => datum.data.isCore || datum.data.isAnchor ? 1.6 : 1,
          shadowColor: 'rgba(32,34,37,0.10)',
          shadowBlur: nodeCount > 220 ? 0 : 7,
          title: datum => datum.data.label,
          typeLabel: datum => datum.data.entityTypeLabel,
          typeColor: datum => datum.data.original?.typeColor || '#74716b',
          influence: datum => datum.data.influence,
          riskLevel: datum => datum.data.riskLevel,
          textColor: datum => datum.data.isCore ? '#fffaf0' : '#202225',
          mutedColor: datum => datum.data.isCore ? '#d7c58f' : '#73716c'
        },
        state: {
          selected: {
            stroke: '#9d7b32',
            lineWidth: 2,
            shadowColor: 'rgba(157,123,50,0.24)',
            shadowBlur: 12
          },
          highlight: { stroke: '#202225', lineWidth: 2 },
          dim: { opacity: 0.16 }
        }
      },
      edge: {
        type: 'line',
        style: {
          stroke: datum => datum.data.color || '#a7a39a',
          lineWidth: datum => Math.max(0.8, Math.min(2.6, Number(datum.data.weight || 1))),
          lineDash: datum => datum.data.dashed ? [5, 4] : undefined,
          endArrow: datum => datum.data.directed && datum.data.isPrimary,
          endArrowSize: 5,
          opacity: datum => datum.data.isCoreLink ? 0.95 : datum.data.isPrimary ? 0.58 : 0.24,
          labelText: datum => nodeCount <= 120 && datum.data.isCoreLink
            ? datum.data.relationTypeLabel
            : '',
          labelFontSize: 9,
          labelFill: '#73716c',
          labelBackground: true,
          labelBackgroundFill: '#f5f4f0',
          labelBackgroundOpacity: 0.9,
          labelPadding: [2, 4]
        },
        state: {
          selected: { stroke: '#9d7b32', lineWidth: 2.4, opacity: 1 },
          highlight: { stroke: '#202225', lineWidth: 2, opacity: 1 },
          dim: { opacity: 0.08 }
        }
      },
      behaviors: [
        'drag-canvas',
        'zoom-canvas',
        'drag-element',
        {
          type: 'click-select',
          state: 'selected',
          multiple: false
        },
        {
          type: 'brush-select',
          key: 'brush-select',
          trigger: ['Shift'],
          immediately: true
        }
      ],
      plugins: pluginOptions({ ...options, compactViewport }, data),
      transforms: ['process-parallel-edges']
    })
    graph.value = markRaw(instance)
    instance.on(NodeEvent.CLICK, event => {
      selectedId.value = event.target.id
      void highlightNeighborhood(event.target.id)
      callbacks.onNodeClick?.(event.target.id)
    })
    instance.on(NodeEvent.DBLCLICK, event => {
      callbacks.onNodeDoubleClick?.(event.target.id)
    })
    instance.on(EdgeEvent.CLICK, event => {
      selectedId.value = event.target.id
      void highlightEdge(event.target.id)
      callbacks.onEdgeClick?.(event.target.id)
    })
    instance.on(CanvasEvent.CLICK, () => {
      selectedId.value = ''
      void clearHighlight()
      callbacks.onCanvasClick?.()
    })
    const startedAt = performance.now()
    await instance.render()
    const readabilityBoost = nodeCount <= 120
      ? (compactViewport ? 1.85 : 1.28)
      : nodeCount <= 220
        ? (compactViewport ? 1.4 : 1.15)
        : 1
    if (readabilityBoost > 1) {
      await instance.zoomBy(readabilityBoost, false)
    }
    const renderMs = performance.now() - startedAt
    callbacks.onRendered?.({ renderMs, nodeCount, edgeCount: data.edges.length })
    resizeObserver = new ResizeObserver(() => instance.resize())
    resizeObserver.observe(container)
    return instance
  }

  async function updateData(data) {
    if (!graph.value) return
    graph.value.setData(plainClone(data))
    graph.value.setLayout(layoutOptions(callbacks.layoutMode, data.nodes.length))
    await graph.value.render()
  }

  async function setLayout(mode) {
    if (!graph.value) return
    callbacks.layoutMode = mode
    graph.value.setLayout(layoutOptions(mode, graph.value.getNodeData().length))
    await graph.value.layout()
    await graph.value.fitView({ when: 'always', direction: 'both' }, false)
  }

  async function focus(id) {
    if (!graph.value || !id) return false
    const datum = graph.value.getElementData(id)
    if (!datum) return false
    await graph.value.setElementState(id, ['selected'], false)
    await graph.value.focusElement(id, REDUCED_MOTION() ? false : { duration: 260 })
    selectedId.value = id
    return true
  }

  async function highlightNeighborhood(id) {
    if (!graph.value || !id) return
    const nodes = graph.value.getNodeData()
    const edges = graph.value.getEdgeData()
    const neighbors = new Set([String(id)])
    const activeEdges = new Set()
    edges.forEach((edge) => {
      if (String(edge.source) === String(id) || String(edge.target) === String(id)) {
        neighbors.add(String(edge.source))
        neighbors.add(String(edge.target))
        activeEdges.add(String(edge.id))
      }
    })
    const states = {}
    nodes.forEach((node) => {
      states[node.id] = String(node.id) === String(id)
        ? ['selected', 'highlight']
        : (neighbors.has(String(node.id)) ? ['highlight'] : ['dim'])
    })
    edges.forEach((edge) => {
      states[edge.id] = activeEdges.has(String(edge.id)) ? ['highlight'] : ['dim']
    })
    await graph.value.setElementState(states, false)
  }

  async function highlightEdge(id) {
    if (!graph.value || !id) return
    const nodes = graph.value.getNodeData()
    const edges = graph.value.getEdgeData()
    const selected = edges.find(edge => String(edge.id) === String(id))
    if (!selected) return
    const endpoints = new Set([String(selected.source), String(selected.target)])
    const states = {}
    nodes.forEach((node) => {
      states[node.id] = endpoints.has(String(node.id)) ? ['highlight'] : ['dim']
    })
    edges.forEach((edge) => {
      states[edge.id] = String(edge.id) === String(id) ? ['selected', 'highlight'] : ['dim']
    })
    await graph.value.setElementState(states, false)
  }

  async function clearHighlight() {
    if (!graph.value) return
    const states = {}
    graph.value.getNodeData().forEach(node => { states[node.id] = [] })
    graph.value.getEdgeData().forEach(edge => { states[edge.id] = [] })
    await graph.value.setElementState(states, false)
  }

  async function fit() {
    await graph.value?.fitView({ when: 'always', direction: 'both' }, false)
  }

  async function zoomBy(ratio) {
    await graph.value?.zoomBy(ratio, REDUCED_MOTION() ? false : { duration: 160 })
  }

  async function exportPng(scale = 2) {
    if (!graph.value) return ''
    const sourceUrl = await graph.value.toDataURL({ type: 'image/png', mode: 'overall' })
    if (scale <= 1 || typeof document === 'undefined') return sourceUrl
    const image = await new Promise((resolve, reject) => {
      const element = new Image()
      element.onload = () => resolve(element)
      element.onerror = reject
      element.src = sourceUrl
    })
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth * scale
    canvas.height = image.naturalHeight * scale
    const context = canvas.getContext('2d')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/png')
  }

  function destroy() {
    resizeObserver?.disconnect()
    resizeObserver = null
    graph.value?.destroy()
    graph.value = null
    selectedId.value = ''
  }

  return {
    graph,
    selectedId,
    create,
    updateData,
    setLayout,
    focus,
    highlightNeighborhood,
    highlightEdge,
    clearHighlight,
    fit,
    zoomBy,
    exportPng,
    destroy
  }
}

export function createPrototypeData(nodeCount = 50) {
  const types = ['government', 'media', 'enterprise', 'platform', 'expert', 'public_group']
  const typeLabels = ['监管', '媒体', '企业', '平台', '专家', '公众']
  const typeColors = ['#4056a1', '#6b7b8c', '#9d7b32', '#7b708e', '#4f766c', '#74716b']
  const baseTime = new Date('2026-01-01').getTime()
  const positionFor = (index) => {
    if (index === 0) return { x: 0, y: 0 }
    const cluster = (index - 1) % 6
    const order = Math.floor((index - 1) / 6)
    const columns = nodeCount >= 300 ? 8 : 5
    const memberCount = Math.max(0, Math.ceil((nodeCount - 1) / 6) - 1)
    const rows = Math.ceil(memberCount / columns)
    const clusterRadius = nodeCount >= 300 ? 1050 : 720
    const angle = -Math.PI / 2 + cluster * (Math.PI * 2 / 6)
    const centerX = Math.cos(angle) * clusterRadius
    const centerY = Math.sin(angle) * clusterRadius
    if (order === 0) {
      return {
        x: centerX,
        y: centerY - rows * 21 - 34
      }
    }
    const memberOrder = order - 1
    const column = memberOrder % columns
    const row = Math.floor(memberOrder / columns)
    return {
      x: centerX + (column - (columns - 1) / 2) * 94,
      y: centerY + (row - (rows - 1) / 2) * 42
    }
  }
  const nodes = Array.from({ length: nodeCount }, (_, index) => ({
    id: `prototype-node-${index}`,
    type: NODE_TYPE,
    style: positionFor(index),
    data: {
      label: index === 0
        ? '核心声誉事件'
        : index <= 6
          ? `${typeLabels[(index - 1) % 6]}群组`
          : `${typeLabels[(index - 1) % 6]} ${String(index).padStart(2, '0')}`,
      entityType: index === 0 ? 'event' : types[(index - 1) % types.length],
      entityTypeLabel: index === 0 ? '事件中心' : typeLabels[(index - 1) % 6],
      influence: (98 - (index % 70)),
      degree: 0,
      isCore: index === 0,
      isAnchor: index > 0 && index <= 6,
      cluster: index === 0 ? 'core' : types[(index - 1) % types.length],
      riskLevel: index % 11 === 0 ? 'high' : index % 5 === 0 ? 'medium' : 'low',
      timestamp: baseTime + (index % 12) * 86400000,
      original: {
        isCore: index === 0,
        typeColor: index === 0 ? '#b99a4a' : typeColors[(index - 1) % 6]
      }
    }
  }))

  const edgeCount = Math.max(nodeCount - 1, Math.floor(nodeCount * 1.7))
  const edges = []
  const addEdge = (source, target, relationType, index, options = {}) => {
    const clusterIndex = target > 0 ? (target - 1) % 6 : 0
    edges.push({
      id: `prototype-edge-${index}`,
      source: `prototype-node-${source}`,
      target: `prototype-node-${target}`,
      data: {
        relationType,
        relationTypeLabel: relationType,
        weight: options.weight || 1,
        directed: true,
        isPrimary: options.isPrimary === true,
        isCoreLink: options.isCoreLink === true,
        color: options.color || typeColors[clusterIndex],
        timestamp: baseTime + (index % 12) * 86400000
      }
    })
  }

  let edgeIndex = 0
  const anchorCount = Math.min(6, Math.max(0, nodeCount - 1))
  for (let index = 1; index <= anchorCount; index += 1) {
    addEdge(0, index, '关注', edgeIndex++, {
      weight: 2.2,
      isPrimary: true,
      isCoreLink: true,
      color: '#b99a4a'
    })
  }

  for (let index = 7; index < nodeCount && edges.length < edgeCount; index += 1) {
    const anchor = ((index - 1) % 6) + 1
    addEdge(anchor, index, '传播', edgeIndex++, {
      weight: 1.4,
      isPrimary: true
    })
  }

  for (let index = 7; index < nodeCount && edges.length < edgeCount; index += 1) {
    addEdge(index - 6, index, '互动', edgeIndex++, { weight: 0.9 })
  }

  for (let index = 0; edges.length < edgeCount; index += 1) {
    const source = 1 + ((index * 7) % Math.max(1, nodeCount - 1))
    let target = 1 + ((index * 13 + 5) % Math.max(1, nodeCount - 1))
    if (target === source) target = 1 + (target % Math.max(1, nodeCount - 1))
    addEdge(source, target, '跨群扩散', edgeIndex++, {
      weight: 0.8,
      color: '#8e8a82'
    })
  }

  const degree = new Map(nodes.map(node => [node.id, 0]))
  edges.forEach((edge) => {
    degree.set(edge.source, (degree.get(edge.source) || 0) + 1)
    degree.set(edge.target, (degree.get(edge.target) || 0) + 1)
  })
  nodes.forEach((node) => {
    node.data.degree = degree.get(node.id) || 0
  })

  return { nodes, edges }
}
