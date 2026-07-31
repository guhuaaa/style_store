<template>
  <div class="simulation-page" data-testid="simulation-page">
    <section class="top-grid">
      <div class="graph-panel" data-testid="simulation-graph">
        <GraphVisualization :graph-data="graphData" :loading="loading" @refresh="loadAll" />
      </div>

      <div class="control-panel" data-testid="simulation-status">
        <div class="panel-header">
          <h3 class="panel-title">推演状态</h3>
          <div class="panel-actions">
            <el-button
              data-testid="report-entry"
              :icon="Document"
              size="small"
              :loading="reportLoading || reportInProgress"
              :disabled="!simulationId"
              @click="handleReportAction"
            >
              {{ reportButtonText }}
            </el-button>
            <el-button
              data-testid="simulation-refresh-button"
              :icon="RefreshRight"
              circle
              :loading="loading"
              @click="refreshMonitorData({ final: isTerminalStatus })"
            />
          </div>
        </div>

        <div class="metric-grid" data-testid="simulation-round-list">
          <DataCard title="当前轮次" :value="roundLabel" icon="Timer" icon-color="var(--ui-risk-medium)" />
          <DataCard title="Agent 数量" :value="agentCount" icon="User" icon-color="var(--ui-charcoal)" />
          <DataCard title="动作总数" :value="totalActions" icon="DataLine" icon-color="var(--ui-risk-low)" />
          <DataCard title="风险热度" :value="riskScore" icon="TrendCharts" icon-color="var(--ui-risk-critical)" />
        </div>

        <div class="run-progress">
          <div class="progress-line">
            <span>运行进度</span>
            <strong>{{ progressPercent }}%</strong>
          </div>
          <el-progress :percentage="progressPercent" :color="progressColor" striped />
          <div v-if="monitorSyncText" class="sync-line">{{ monitorSyncText }}</div>
        </div>

        <div v-if="!hasRuntimeData" class="empty-inline">
          推演尚未产生运行数据。启动后这里会显示轮次、动作数和时间线。
        </div>

        <div v-if="completionText" class="completion-note">{{ completionText }}</div>
        <div v-if="reportStatusText" class="report-status" :class="{ failed: reportStatus === 'failed' }">
          <div class="progress-line">
            <span>{{ reportStatusText }}</span>
            <strong>{{ reportProgress }}%</strong>
          </div>
          <el-progress v-if="reportInProgress" :percentage="reportProgress" :color="progressColor" striped />
        </div>
        <div v-if="lastLoadError" class="load-warning">{{ lastLoadError }}</div>
      </div>
    </section>

    <section class="bottom-grid">
      <div class="panel trend-panel" data-testid="risk-trend-panel">
        <div class="panel-header">
          <div>
            <h3 class="panel-title">风险趋势</h3>
            <p v-if="trendData.times.length" class="panel-hint">{{ trendSourceText }}</p>
          </div>
        </div>
        <div v-if="trendData.times.length" class="chart-wrapper">
          <SentimentTrendChart :data="trendData" />
        </div>
        <div v-if="trendData.times.length" class="trend-summary">
          <div v-for="item in trendSummary" :key="item.label" class="trend-summary-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
        <div v-else class="empty-state trend-empty">
          <strong>暂无趋势数据</strong>
          <span>{{ trendEmptyReason }}</span>
          <el-button size="small" :loading="loading" @click="refreshMonitorData()">重新检查</el-button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3 class="panel-title">关键传播节点</h3>
        </div>
        <div v-if="keyNodes.length" class="node-list">
          <div v-for="(node, idx) in keyNodes" :key="node.uuid || node.name" class="key-node-item">
            <div class="node-rank">{{ idx + 1 }}</div>
            <div class="node-info">
              <div class="node-name">{{ node.name }}</div>
              <div class="node-type">{{ node.type }}</div>
            </div>
            <div class="node-influence">
              <div class="influence-bar">
                <div class="influence-fill" :style="{ width: `${node.influence}%` }"></div>
              </div>
              <span class="influence-value">影响力 {{ node.influence }}</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-state">暂无可计算的关键节点</div>
      </div>
    </section>

    <section class="panel" data-testid="simulation-content">
      <div class="panel-header">
        <h3 class="panel-title">最新模拟内容</h3>
      </div>
      <div v-if="recentPosts.length" class="post-list">
        <article v-for="post in recentPosts" :key="post.id || post.post_id || post.created_at" class="post-item">
          <div class="post-meta">
            <span>{{ displayPlatform(post) }}</span>
            <span>{{ post.created_at || post.timestamp || '-' }}</span>
          </div>
          <p>{{ postContent(post) }}</p>
        </article>
      </div>
      <div v-else class="empty-state">尚未读取到帖子或事件。推演运行后会自动刷新。</div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, RefreshRight } from '@element-plus/icons-vue'
import DataCard from '../components/DataCard.vue'
import GraphVisualization from '../components/GraphVisualization.vue'
import SentimentTrendChart from '../components/charts/SentimentTrendChart.vue'
import { getGraphData } from '../api/graph'
import {
  getRunStatus,
  getSimulation,
  getSimulationConfig,
  getSimulationPosts,
  getSimulationProfiles,
  getSimulationTimeline
} from '../api/simulation'
import { generateReport, getReportBySimulation, getReportStatus } from '../api/report'
import { API_BASE_URL } from '../api'
import { useProjectStore } from '../stores/project'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const STORAGE_KEYS = {
  projectId: 'risklens_current_project_id',
  graphId: 'risklens_current_graph_id',
  simulationId: 'risklens_current_simulation_id',
  reportId: 'risklens_current_report_id',
  reportTaskId: 'risklens_current_report_task_id',
  monitorSnapshot: 'risklens_monitor_snapshot'
}
const PLATFORMS = ['twitter', 'reddit']
const TERMINAL_STATUSES = new Set(['completed', 'stopped', 'failed'])
const ACTIVE_RUN_STATUSES = new Set(['starting', 'running', 'stopping', 'paused'])
const SNAPSHOT_VERSION = 1
const platformNameMap = {
  reddit: '投资者社区',
  twitter: '社交媒体'
}

const routeSimulationId = computed(() => {
  const raw = Array.isArray(route.params.simulationId) ? route.params.simulationId[0] : route.params.simulationId
  return raw && raw !== ':simulationId' ? raw : ''
})
const simulationId = computed(() => routeSimulationId.value || localStorage.getItem(STORAGE_KEYS.simulationId) || '')

const loading = ref(false)
const simulationState = ref({})
const runState = ref({})
const graphData = ref(null)
const config = ref(null)
const profiles = ref([])
const timeline = ref([])
const posts = ref([])
const activeGraphId = ref(localStorage.getItem(STORAGE_KEYS.graphId) || '')
const lastLoadError = ref('')
const finalRefreshCompleted = ref(false)
const reportLoading = ref(false)
const reportId = ref('')
const reportTaskId = ref(localStorage.getItem(STORAGE_KEYS.reportTaskId) || '')
const reportStatus = ref('')
const reportProgress = ref(0)
const reportMessage = ref('')
const cacheRestored = ref(false)
const lastLoadedAt = ref('')
const finalRefreshMissing = ref([])

let refreshTimer = null
let pollingInFlight = false
let reportTimer = null
let reportPollingInFlight = false
let reportNavigateOnComplete = false
let reportEventSource = null
let reportSseFailures = 0

const currentStatus = computed(() => {
  const runnerStatus = normalizeStatus(runState.value.runner_status)
  const simulationStatus = normalizeStatus(simulationState.value.status)

  if (TERMINAL_STATUSES.has(runnerStatus)) return runnerStatus
  if (ACTIVE_RUN_STATUSES.has(runnerStatus)) return runnerStatus
  if (simulationStatus && simulationStatus !== 'idle') return simulationStatus
  return runnerStatus || 'idle'
})

const isTerminalStatus = computed(() => TERMINAL_STATUSES.has(currentStatus.value))

const completionText = computed(() => {
  if (!isTerminalStatus.value) return ''
  if (currentStatus.value === 'failed') {
    return runState.value.error ? `推演失败：${runState.value.error}` : '推演失败，已保留当前可用结果'
  }
  if (currentStatus.value === 'stopped') {
    if (!finalRefreshCompleted.value) return '推演已停止，正在加载最终结果'
    return finalRefreshMissing.value.length ? '推演已停止，已保留当前可用结果，部分数据可稍后刷新' : '推演已停止，已加载最终可用结果'
  }
  if (!finalRefreshCompleted.value) return '推演已完成，正在加载最终结果'
  return finalRefreshMissing.value.length ? '推演已完成，已加载可用结果，部分数据可稍后刷新' : '推演已完成，已加载最终模拟结果'
})

const progressPercent = computed(() => {
  if (currentStatus.value === 'completed') return 100
  const raw = Number(runState.value.progress_percent || 0)
  return clampPercent(raw)
})

const monitorSyncText = computed(() => {
  if (!lastLoadedAt.value && !cacheRestored.value) return ''
  const prefix = cacheRestored.value ? '已从本地快照恢复，' : ''
  return `${prefix}最近同步：${formatDateTime(lastLoadedAt.value)}`
})

const hasRuntimeData = computed(() => {
  return !!totalActions.value || !!timeline.value.length || !!posts.value.length
})

const roundLabel = computed(() => {
  const current = runState.value.current_round ?? simulationState.value.current_round ?? 0
  const total = runState.value.total_rounds || runState.value.total_simulation_hours || config.value?.time_config?.total_simulation_hours || 0
  return total ? `${current}/${total}` : current
})

const agentCount = computed(() => {
  return simulationState.value.profiles_count || profiles.value.length || config.value?.agent_configs?.length || 0
})

const totalActions = computed(() => {
  return runState.value.total_actions_count ||
    ((runState.value.twitter_actions_count || 0) + (runState.value.reddit_actions_count || 0)) ||
    timeline.value.reduce((sum, row) => sum + (row.total_actions || row.actions_count || 0), 0) ||
    posts.value.length
})

const riskScore = computed(() => {
  const edgeCount = graphData.value?.edges?.length || 0
  const negativeCount = trendData.value.negative.reduce((sum, value) => sum + value, 0)
  return Math.min(100, Math.round(edgeCount * 2 + posts.value.length * 2 + negativeCount * 4 + totalActions.value / 20))
})

const progressColor = computed(() => {
  if (currentStatus.value === 'failed') return 'var(--ui-risk-critical)'
  if (riskScore.value >= 70) return 'var(--ui-risk-critical)'
  if (riskScore.value >= 40) return 'var(--ui-risk-medium)'
  return 'var(--ui-risk-low)'
})

const keyNodes = computed(() => {
  const nodes = graphData.value?.nodes || []
  const edges = graphData.value?.edges || []
  const degreeMap = new Map()

  edges.forEach((edge) => {
    const source = edge.source_node_uuid || edge.source_uuid || edge.source
    const target = edge.target_node_uuid || edge.target_uuid || edge.target
    if (source) degreeMap.set(source, (degreeMap.get(source) || 0) + 1)
    if (target) degreeMap.set(target, (degreeMap.get(target) || 0) + 1)
  })

  const maxDegree = Math.max(1, ...degreeMap.values())
  return nodes
    .map(node => {
      const labels = Array.isArray(node.labels) ? node.labels : []
      const type = node.type || labels.find(label => !['Entity', 'Node', 'GraphMeta'].includes(label)) || labels[0] || 'Entity'
      const uuid = node.uuid || node.uuid_
      const degree = degreeMap.get(uuid) || 0
      return {
        uuid,
        name: node.name,
        type,
        influence: Math.max(8, Math.round((degree / maxDegree) * 100))
      }
    })
    .filter(node => node.name)
    .sort((a, b) => b.influence - a.influence)
    .slice(0, 5)
})

const trendState = computed(() => {
  const postTrend = buildRiskTrend(posts.value)
  if (postTrend.length) return { rows: postTrend, source: 'posts' }

  const timelineTrend = buildTimelineTrend(timeline.value)
  if (timelineTrend.length) return { rows: timelineTrend, source: 'timeline' }

  if (totalActions.value) {
    return {
      rows: [{
        label: String(runState.value.current_round ?? 0),
        sort: Number(runState.value.current_round ?? 0),
        positive: 0,
        negative: 0,
        neutral: totalActions.value,
        total: totalActions.value
      }],
      source: 'run-status'
    }
  }

  return { rows: [], source: 'none' }
})

const trendData = computed(() => {
  if (!trendState.value.rows.length) return { times: [], positive: [], negative: [], neutral: [] }
  return toChartData(trendState.value.rows)
})

const trendSourceText = computed(() => {
  const map = {
    posts: '基于最新模拟内容按轮次 / 时间聚合，展示正面、负面和中性变化。',
    timeline: '基于模拟时间线按轮次聚合，展示可用的情绪和动作变化。',
    'run-status': '当前仅获取到动作总量，先以中性趋势兜底展示，后续内容返回后会自动更新。'
  }
  return map[trendState.value.source] || ''
})

const trendSummary = computed(() => {
  if (!trendData.value.times.length) return []
  const lastIndex = trendData.value.times.length - 1
  const positive = trendData.value.positive[lastIndex] || 0
  const negative = trendData.value.negative[lastIndex] || 0
  const neutral = trendData.value.neutral[lastIndex] || 0
  const total = positive + negative + neutral
  const negativeRatio = total ? `${Math.round((negative / total) * 100)}%` : '0%'

  return [
    { label: '最近节点', value: trendData.value.times[lastIndex] },
    { label: '负面占比', value: negativeRatio },
    { label: '风险热度', value: riskScore.value }
  ]
})

const trendEmptyReason = computed(() => {
  if (!simulationId.value) return '暂无可恢复的模拟 ID，请先在风险推演页启动任务。'
  if (lastLoadError.value && ['时间线', '模拟内容', '运行状态'].some(key => lastLoadError.value.includes(key))) {
    return '趋势依赖的运行数据暂未完整返回，可稍后刷新或检查后端任务状态。'
  }
  if (['created', 'preparing', 'ready', 'idle'].includes(currentStatus.value)) {
    return '推演尚未产生运行数据，启动模拟后会自动展示趋势。'
  }
  if (timeline.value.length || posts.value.length) {
    return '当前数据缺少可聚合的轮次、动作数或情绪字段，系统会在新内容返回后继续尝试生成。'
  }
  return '当前模拟暂未返回时间线或帖子内容，可稍后重新检查。'
})

const recentPosts = computed(() => sortByTimeDesc(posts.value).slice(0, 8))

const reportInProgress = computed(() => {
  return ['queued', 'pending', 'processing', 'planning', 'generating', 'running'].includes(reportStatus.value)
})

const reportButtonText = computed(() => {
  if (reportStatus.value === 'completed' && reportId.value) return '查看分析报告'
  if (reportInProgress.value) return '报告生成中'
  if (reportStatus.value === 'failed') return '重新生成报告'
  return '生成分析报告'
})

const reportStatusText = computed(() => {
  if (!reportStatus.value) return ''
  if (reportStatus.value === 'completed') return '分析报告已生成'
  if (reportStatus.value === 'failed') return reportMessage.value || '分析报告生成失败'
  return reportMessage.value || '分析报告生成中'
})

function loadAll() {
  return refreshMonitorData({ final: isTerminalStatus.value })
}

async function refreshMonitorData(options = {}) {
  const { final = false, silent = false } = options
  const id = simulationId.value
  if (!id) {
    lastLoadError.value = '暂无可恢复的模拟 ID'
    return
  }

  if (!silent) loading.value = true
  const errors = []
  let hasFreshPayload = false

  try {
    persistContext({ simulationId: id })

    const results = await Promise.allSettled([
      getSimulation(id),
      getRunStatus(id),
      fetchProfiles(id),
      getSimulationConfig(id),
      getSimulationTimeline(id, 0),
      fetchPosts(id)
    ])

    if (results[0].status === 'fulfilled') {
      hasFreshPayload = true
      const state = results[0].value.data || {}
      simulationState.value = state
      projectStore.setCurrentSimulation(state)
      persistContext({
        projectId: state.project_id,
        graphId: state.graph_id,
        simulationId: id
      })
      if (state.graph_id) activeGraphId.value = state.graph_id
    } else {
      errors.push('模拟状态')
    }

    if (results[1].status === 'fulfilled') {
      hasFreshPayload = true
      runState.value = results[1].value.data || {}
    } else {
      errors.push('运行状态')
    }

    if (results[2].status === 'fulfilled') {
      hasFreshPayload = true
      profiles.value = results[2].value
    } else {
      errors.push('Agent profiles')
    }

    if (results[3].status === 'fulfilled') {
      hasFreshPayload = true
      config.value = results[3].value.data?.config || results[3].value.data || null
    } else {
      errors.push('模拟配置')
    }

    if (results[4].status === 'fulfilled') {
      hasFreshPayload = true
      timeline.value = results[4].value.data?.timeline || []
    } else {
      errors.push('时间线')
    }

    if (results[5].status === 'fulfilled') {
      hasFreshPayload = true
      posts.value = results[5].value
    } else {
      errors.push('模拟内容')
    }

    await loadGraph(activeGraphId.value, errors)

    lastLoadError.value = errors.length ? `部分数据暂未加载：${errors.slice(0, 3).join('、')}` : ''
    lastLoadedAt.value = new Date().toISOString()
    cacheRestored.value = false
    if (hasFreshPayload || hasRuntimeData.value || graphData.value) {
      persistMonitorSnapshot(id)
    }
    if (final) {
      finalRefreshCompleted.value = true
      finalRefreshMissing.value = errors
    }
  } catch (err) {
    lastLoadError.value = err.message
    ElMessage.error(err.message)
  } finally {
    if (!silent) loading.value = false
  }
}

async function loadGraph(graphId, errors = []) {
  if (!graphId) return
  try {
    const res = await getGraphData(graphId)
    graphData.value = res.data
    projectStore.setGraphData(res.data)
  } catch (err) {
    errors.push('风险图谱')
  }
}

async function fetchProfiles(id) {
  const results = await Promise.allSettled(
    PLATFORMS.map(platform => getSimulationProfiles(id, platform).then(res => ({
      platform,
      profiles: res.data?.profiles || []
    })))
  )
  const fulfilled = results.filter(result => result.status === 'fulfilled')
  if (!fulfilled.length && results.length) {
    throw results[0].reason || new Error('Agent profiles 加载失败')
  }

  return fulfilled.flatMap(result =>
    result.value.profiles.map(profile => ({ ...profile, platform: result.value.platform }))
  )
}

async function fetchPosts(id) {
  const results = await Promise.allSettled(
    PLATFORMS.map(platform => getSimulationPosts(id, platform, 50, 0).then(res => ({
      platform,
      posts: res.data?.posts || []
    })))
  )
  const fulfilled = results.filter(result => result.status === 'fulfilled')
  if (!fulfilled.length && results.length) {
    throw results[0].reason || new Error('模拟内容加载失败')
  }

  return sortByTimeDesc(fulfilled.flatMap(result =>
    result.value.posts.map(post => ({ ...post, platform: post.platform || result.value.platform }))
  ))
}

async function loadReportForSimulation() {
  if (!simulationId.value) return

  const existingReportId = reportId.value || localStorage.getItem(STORAGE_KEYS.reportId) || ''
  reportId.value = existingReportId
  reportStatus.value = ''
  reportProgress.value = 0
  reportMessage.value = ''

  try {
    const res = await getReportBySimulation(simulationId.value)
    updateReportState(res.data || {})
    if (reportInProgress.value && reportId.value) {
      startReportStreaming(reportId.value)
    }
  } catch (err) {
    if (isNotFoundError(err)) {
      if (reportTaskId.value) {
        reportStatus.value = 'generating'
        reportMessage.value = '报告生成中，正在恢复任务状态'
      } else {
        reportId.value = ''
        localStorage.removeItem(STORAGE_KEYS.reportId)
      }
    } else {
      reportMessage.value = err.message || '报告状态读取失败'
    }
  }
}

async function handleReportAction() {
  if (!simulationId.value) {
    ElMessage.warning('暂无可用的仿真 ID')
    return
  }

  if (reportStatus.value === 'completed' && reportId.value) {
    router.push(`/report/${reportId.value}`)
    return
  }

  if (reportInProgress.value) {
    startReportPolling({ navigateOnComplete: true })
    return
  }

  await startReportGeneration()
}

async function startReportGeneration() {
  reportLoading.value = true
  reportMessage.value = ''

  try {
    const res = await generateReport({
      simulation_id: simulationId.value,
      force_regenerate: reportStatus.value === 'failed'
    })
    const data = res.data || {}
    updateReportState(data)

    if (data.task_id) {
      reportTaskId.value = data.task_id
      localStorage.setItem(STORAGE_KEYS.reportTaskId, data.task_id)
      if (data.report_id) {
        reportNavigateOnComplete = true
        startReportStreaming(data.report_id)
      } else {
        startReportPolling({ navigateOnComplete: true })
      }
    }

    if ((data.status === 'completed' || data.already_generated) && data.report_id) {
      stopReportPolling()
      router.push(`/report/${data.report_id}`)
    }
  } catch (err) {
    reportStatus.value = 'failed'
    reportProgress.value = 0
    reportMessage.value = err.message || '报告生成启动失败'
    ElMessage.error(reportMessage.value)
  } finally {
    reportLoading.value = false
  }
}

function startReportPolling(options = {}) {
  reportNavigateOnComplete = reportNavigateOnComplete || Boolean(options.navigateOnComplete)
  stopReportStreaming()
  stopReportPolling()
  pollReportStatus()
  reportTimer = setInterval(pollReportStatus, 4000)
}

function startReportStreaming(id) {
  if (!id || typeof EventSource === 'undefined') {
    startReportPolling({ navigateOnComplete: reportNavigateOnComplete })
    return
  }
  stopReportPolling()
  stopReportStreaming()
  reportSseFailures = 0
  const url = `${API_BASE_URL}/api/report/${encodeURIComponent(id)}/events`
  reportEventSource = new EventSource(url, { withCredentials: true })

  const progressByEvent = {
    planning_started: 8,
    outline_ready: 18,
    section_started: 25,
    tool_completed: 45,
    section_draft_ready: 72,
    section_completed: 88,
    report_completed: 100
  }
  const labels = {
    planning_started: '正在规划报告大纲',
    outline_ready: '大纲已就绪，开始检索证据',
    section_started: '正在生成章节',
    tool_completed: '章节证据检索完成',
    section_draft_ready: '章节初稿已生成',
    section_completed: '章节一致性编辑完成',
    report_completed: '分析报告已生成',
    report_failed: '报告生成失败'
  }

  Object.keys(labels).forEach(eventName => {
    reportEventSource.addEventListener(eventName, async event => {
      reportSseFailures = 0
      const payload = JSON.parse(event.data || '{}')
      reportMessage.value = payload.message || labels[eventName]
      if (progressByEvent[eventName] !== undefined) {
        reportProgress.value = Math.max(
          reportProgress.value,
          progressByEvent[eventName]
        )
      }
      if (eventName === 'report_completed') {
        reportStatus.value = 'completed'
        reportProgress.value = 100
        stopReportStreaming()
        reportTaskId.value = ''
        localStorage.removeItem(STORAGE_KEYS.reportTaskId)
        if (reportNavigateOnComplete && reportId.value) {
          reportNavigateOnComplete = false
          await router.push(`/report/${reportId.value}`)
        }
      } else if (eventName === 'report_failed') {
        reportStatus.value = 'failed'
        reportMessage.value = payload.error || labels[eventName]
        stopReportStreaming()
        reportNavigateOnComplete = false
        ElMessage.error(reportMessage.value)
      } else {
        reportStatus.value = 'generating'
      }
    })
  })

  reportEventSource.onerror = () => {
    reportSseFailures += 1
    if (reportSseFailures < 2) return
    stopReportStreaming()
    reportMessage.value = '实时事件连接中断，已切换为状态轮询'
    startReportPolling({ navigateOnComplete: reportNavigateOnComplete })
  }
}

function stopReportStreaming() {
  if (reportEventSource) {
    reportEventSource.close()
    reportEventSource = null
  }
}

function stopReportPolling() {
  if (reportTimer) {
    clearInterval(reportTimer)
    reportTimer = null
  }
}

async function pollReportStatus() {
  if (reportPollingInFlight || (!reportTaskId.value && !simulationId.value)) return
  reportPollingInFlight = true

  try {
    const payload = { simulation_id: simulationId.value }
    if (reportTaskId.value) payload.task_id = reportTaskId.value
    const res = await getReportStatus(payload)
    const data = res.data || {}
    updateReportState(data)

    if (data.status === 'completed') {
      stopReportPolling()
      reportTaskId.value = ''
      localStorage.removeItem(STORAGE_KEYS.reportTaskId)
      const completedReportId =
        data.report_id || data.result?.report_id || data.metadata?.report_id || reportId.value
      if (reportNavigateOnComplete && completedReportId) {
        reportNavigateOnComplete = false
        await router.push(`/report/${completedReportId}`)
      }
    }

    if (data.status === 'failed') {
      stopReportPolling()
      reportNavigateOnComplete = false
      reportTaskId.value = ''
      localStorage.removeItem(STORAGE_KEYS.reportTaskId)
      reportMessage.value = data.error || data.message || '报告生成失败'
      ElMessage.error(reportMessage.value)
    }
  } catch (err) {
    reportMessage.value = err.message || '报告状态查询失败'
    if (isNotFoundError(err)) {
      stopReportPolling()
      reportTaskId.value = ''
      localStorage.removeItem(STORAGE_KEYS.reportTaskId)
    }
  } finally {
    reportPollingInFlight = false
  }
}

function updateReportState(data = {}) {
  const resolvedReportId = data.report_id || data.result?.report_id || data.metadata?.report_id
  if (resolvedReportId) {
    reportId.value = resolvedReportId
    localStorage.setItem(STORAGE_KEYS.reportId, resolvedReportId)
  }

  if (data.task_id) {
    reportTaskId.value = data.task_id
    localStorage.setItem(STORAGE_KEYS.reportTaskId, data.task_id)
  }

  if (data.status) reportStatus.value = normalizeReportStatus(data.status)
  if (data.progress !== undefined && data.progress !== null) {
    reportProgress.value = clampPercent(Number(data.progress))
  } else if (reportStatus.value === 'completed') {
    reportProgress.value = 100
  }

  reportMessage.value = data.error || data.message || reportMessage.value
}

function normalizeReportStatus(status) {
  if (status === 'processing') return 'generating'
  if (status === 'running') return 'generating'
  return status
}

function clampPercent(value) {
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function isNotFoundError(err) {
  return err?.response?.status === 404
}

async function bootstrapMonitor() {
  stopPolling()
  stopReportPolling()
  finalRefreshCompleted.value = false
  finalRefreshMissing.value = []

  if (!simulationId.value) {
    lastLoadError.value = '暂无可恢复的模拟 ID'
    return
  }

  const restored = hydrateMonitorSnapshot(simulationId.value)
  await refreshMonitorData({ silent: restored })
  await loadReportForSimulation()

  if (reportTaskId.value && reportStatus.value !== 'completed') {
    reportStatus.value = reportStatus.value || 'generating'
    startReportPolling()
  }

  if (isTerminalStatus.value) {
    await refreshMonitorData({ final: true, silent: true })
  } else {
    startPolling()
  }
}

async function pollSimulation() {
  if (pollingInFlight) return
  pollingInFlight = true

  try {
    await refreshMonitorData({ silent: true })

    if (isTerminalStatus.value) {
      await refreshMonitorData({ final: true, silent: true })
      stopPolling()
    }
  } finally {
    pollingInFlight = false
  }
}

function startPolling() {
  stopPolling()
  refreshTimer = setInterval(pollSimulation, 8000)
}

function stopPolling() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

function persistContext({ projectId, graphId, simulationId: id }) {
  if (projectId) localStorage.setItem(STORAGE_KEYS.projectId, projectId)
  if (graphId) localStorage.setItem(STORAGE_KEYS.graphId, graphId)
  if (id) localStorage.setItem(STORAGE_KEYS.simulationId, id)
}

function getSnapshotKey(id) {
  return `${STORAGE_KEYS.monitorSnapshot}:${id}`
}

function hydrateMonitorSnapshot(id) {
  try {
    const raw = localStorage.getItem(getSnapshotKey(id))
    if (!raw) return false
    const snapshot = JSON.parse(raw)
    if (snapshot.version !== SNAPSHOT_VERSION || snapshot.simulationId !== id) return false

    simulationState.value = snapshot.simulationState || {}
    runState.value = snapshot.runState || {}
    graphData.value = snapshot.graphData || null
    config.value = snapshot.config || null
    profiles.value = snapshot.profiles || []
    timeline.value = snapshot.timeline || []
    posts.value = snapshot.posts || []
    activeGraphId.value = snapshot.activeGraphId || activeGraphId.value
    reportId.value = snapshot.reportId || reportId.value
    reportTaskId.value = snapshot.reportTaskId || reportTaskId.value
    reportStatus.value = snapshot.reportStatus || reportStatus.value
    reportProgress.value = snapshot.reportProgress || reportProgress.value
    reportMessage.value = snapshot.reportMessage || reportMessage.value
    lastLoadedAt.value = snapshot.updatedAt || ''
    cacheRestored.value = true

    if (snapshot.projectId || snapshot.graphId || snapshot.simulationId) {
      persistContext({
        projectId: snapshot.projectId,
        graphId: snapshot.graphId,
        simulationId: snapshot.simulationId
      })
    }
    return true
  } catch (err) {
    return false
  }
}

function persistMonitorSnapshot(id) {
  const snapshot = buildMonitorSnapshot(id)
  try {
    localStorage.setItem(getSnapshotKey(id), JSON.stringify(snapshot))
  } catch (err) {
    try {
      localStorage.setItem(getSnapshotKey(id), JSON.stringify({
        ...snapshot,
        graphData: null,
        config: null,
        profiles: snapshot.profiles.slice(0, 20),
        posts: snapshot.posts.slice(0, 30),
        timeline: snapshot.timeline.slice(-30)
      }))
    } catch (innerErr) {
      // 本地快照只是体验增强，写入失败不影响任务主流程。
    }
  }
}

function buildMonitorSnapshot(id) {
  return {
    version: SNAPSHOT_VERSION,
    simulationId: id,
    projectId: simulationState.value.project_id || localStorage.getItem(STORAGE_KEYS.projectId) || '',
    graphId: activeGraphId.value || simulationState.value.graph_id || localStorage.getItem(STORAGE_KEYS.graphId) || '',
    activeGraphId: activeGraphId.value,
    simulationState: simulationState.value,
    runState: runState.value,
    graphData: graphData.value,
    config: config.value,
    profiles: profiles.value.slice(0, 100),
    timeline: timeline.value.slice(-80),
    posts: posts.value.slice(0, 100),
    reportId: reportId.value,
    reportTaskId: reportTaskId.value,
    reportStatus: reportStatus.value,
    reportProgress: reportProgress.value,
    reportMessage: reportMessage.value,
    updatedAt: lastLoadedAt.value || new Date().toISOString()
  }
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
}

function buildRiskTrend(postList = []) {
  const rows = new Map()

  postList.forEach((post, index) => {
    const bucket = getPostBucket(post, index)
    if (!rows.has(bucket.key)) {
      rows.set(bucket.key, {
        label: bucket.label,
        sort: bucket.sort,
        positive: 0,
        neutral: 0,
        negative: 0,
        total: 0
      })
    }

    const item = rows.get(bucket.key)
    item.total += 1
    item[classifySentiment(post)] += 1
  })

  return Array.from(rows.values()).sort((a, b) => a.sort - b.sort)
}

function buildTimelineTrend(rows = []) {
  return rows
    .map((row, index) => {
      const total = Number(row.total_posts ?? row.posts_count ?? row.total_actions ?? row.actions_count ?? ((row.twitter_actions || 0) + (row.reddit_actions || 0)) ?? 0)
      const positive = Number(row.positive_count ?? row.positive ?? 0)
      const negative = Number(row.negative_count ?? row.negative ?? row.risk_count ?? 0)
      const neutral = Number(row.neutral_count ?? row.neutral ?? Math.max(0, total - positive - negative))
      const round = row.round_num ?? row.round ?? index

      return {
        label: String(round),
        sort: Number(round) || index,
        positive,
        negative,
        neutral,
        total: total || positive + negative + neutral
      }
    })
    .filter(row => row.total > 0)
    .slice(-12)
}

function toChartData(rows) {
  const visibleRows = rows.slice(-12)
  return {
    times: visibleRows.map(row => row.label),
    positive: visibleRows.map(row => row.positive),
    negative: visibleRows.map(row => row.negative),
    neutral: visibleRows.map(row => row.neutral)
  }
}

function getPostBucket(post, index) {
  const round = post.round_num ?? post.round ?? post.roundNum
  if (round !== undefined && round !== null && round !== '') {
    return { key: `round-${round}`, label: String(round), sort: Number(round) || index }
  }

  const time = post.created_at || post.timestamp
  const parsed = time ? new Date(time) : null
  if (parsed && !Number.isNaN(parsed.getTime())) {
    const label = parsed.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
    return { key: `time-${label}`, label, sort: parsed.getTime() }
  }

  const batch = Math.floor(index / 5) + 1
  return { key: `batch-${batch}`, label: `批次${batch}`, sort: batch }
}

function classifySentiment(post) {
  const raw = String(post.sentiment || post.sentiment_type || '').toLowerCase()
  if (['negative', '负面'].includes(raw)) return 'negative'
  if (['positive', '正面'].includes(raw)) return 'positive'
  if (['neutral', '中性'].includes(raw)) return 'neutral'

  const content = postContent(post)
  const negativeKeywords = ['延期', '逾期', '投诉', '风险', '被执行', '违约', '担保', '监管', '追责', '亏损', '无法兑付']
  const positiveKeywords = ['正常', '兑付', '保障', '披露', '解决', '方案', '协调']

  if (negativeKeywords.some(keyword => content.includes(keyword))) return 'negative'
  if (positiveKeywords.some(keyword => content.includes(keyword))) return 'positive'
  return 'neutral'
}

function displayPlatform(post) {
  const raw = String(post.platform || post.source || '').toLowerCase()
  return platformNameMap[raw] || post.source || post.platform || '模拟事件'
}

function postContent(post) {
  const actionArgs = typeof post.action_args === 'object' && post.action_args ? post.action_args : {}
  return String(
    post.content ||
    post.text ||
    post.body ||
    post.title ||
    post.message ||
    actionArgs.content ||
    actionArgs.text ||
    post.result ||
    JSON.stringify(post)
  )
}

function sortByTimeDesc(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.created_at || a.timestamp || 0).getTime()
    const bTime = new Date(b.created_at || b.timestamp || 0).getTime()
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime)
  })
}

onMounted(bootstrapMonitor)

watch(() => route.params.simulationId, bootstrapMonitor)

onUnmounted(() => {
  stopPolling()
  stopReportPolling()
  stopReportStreaming()
})
</script>

<style scoped>
.simulation-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.top-grid,
.bottom-grid {
  display: grid;
  gap: 20px;
}

.top-grid {
  grid-template-columns: minmax(0, 1.5fr) minmax(360px, 0.8fr);
  min-height: 520px;
}

.bottom-grid {
  grid-template-columns: 1fr 1fr;
}

.panel,
.graph-panel,
.control-panel {
  background-color: var(--rl-surface);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
  padding: 20px;
}

.graph-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  padding: 0;
}

.graph-panel :deep(.graph-visualization) {
  flex: 1;
  min-height: 520px;
  border: 0;
  border-radius: 0;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.panel-title {
  margin: 0;
  color: var(--rl-text-primary);
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  font-size: 1rem;
  font-weight: 600;
}

.panel-subtitle {
  margin: 6px 0 0;
  color: var(--rl-text-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
}

.panel-hint {
  margin: 6px 0 0;
  color: var(--rl-text-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}

.metric-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.run-progress {
  padding: 16px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.progress-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: var(--rl-text-secondary);
  font-size: 0.85rem;
}

.progress-line strong {
  color: var(--rl-text-primary);
}

.sync-line {
  margin-top: 10px;
  color: var(--rl-text-muted);
  font-size: 0.76rem;
  line-height: 1.4;
}

.empty-inline,
.empty-state {
  color: var(--rl-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.completion-note,
.load-warning,
.report-status {
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.5;
}

.completion-note {
  color: var(--rl-safe);
  background-color: rgba(42, 157, 143, 0.12);
}

.load-warning {
  color: var(--rl-gold);
  background-color: rgba(212, 175, 55, 0.12);
}

.report-status {
  color: var(--rl-text-secondary);
  background-color: var(--rl-surface-elevated);
  border: 1px solid var(--rl-border);
}

.report-status.failed {
  color: var(--rl-risk);
  background-color: rgba(230, 57, 70, 0.12);
  border-color: rgba(230, 57, 70, 0.3);
}

.report-status .progress-line {
  margin-bottom: 0;
}

.report-status .el-progress {
  margin-top: 10px;
}

.empty-state {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.chart-wrapper {
  height: 300px;
}

.trend-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.trend-summary-item {
  padding: 10px 12px;
  background-color: var(--rl-surface-elevated);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
  min-width: 0;
}

.trend-summary-item span {
  display: block;
  color: var(--rl-text-muted);
  font-size: 0.72rem;
  margin-bottom: 4px;
}

.trend-summary-item strong {
  color: var(--rl-text-primary);
  font-size: 0.95rem;
  overflow-wrap: anywhere;
}

.trend-empty {
  flex-direction: column;
  gap: 10px;
  padding: 20px;
}

.trend-empty strong {
  color: var(--rl-text-primary);
  font-size: 0.95rem;
}

.trend-empty span {
  max-width: 360px;
}

.node-list,
.post-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.key-node-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.node-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rl-gold), var(--rl-brand-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-name {
  font-weight: 500;
  color: var(--rl-text-primary);
  overflow-wrap: anywhere;
}

.node-type {
  margin-top: 2px;
  font-size: 0.75rem;
  color: var(--rl-text-muted);
}

.node-influence {
  width: 120px;
  flex-shrink: 0;
}

.influence-bar {
  height: 6px;
  background-color: var(--rl-border);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.influence-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--rl-gold), var(--rl-risk));
  border-radius: 3px;
}

.influence-value {
  font-size: 0.7rem;
  color: var(--rl-text-muted);
}

.post-item {
  padding: 14px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--rl-text-muted);
  font-size: 0.75rem;
  margin-bottom: 8px;
}

.post-item p {
  margin: 0;
  color: var(--rl-text-primary);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

@media (max-width: 1280px) {
  .top-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .top-grid {
    min-height: 0;
  }
}

@media (max-width: 720px) {
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .trend-summary {
    grid-template-columns: 1fr;
  }

  .node-influence {
    width: 88px;
  }
}

.panel,
.graph-panel,
.control-panel {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 94%, transparent), color-mix(in srgb, var(--ui-paper) 22%, var(--rl-surface))),
    var(--craft-fiber);
  border-radius: var(--craft-radius);
  box-shadow: var(--craft-shadow-soft);
}

.panel::before,
.graph-panel::before,
.control-panel::before {
  content: "";
  position: absolute;
  inset: 7px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--rl-border) 58%, transparent);
  border-radius: 3px;
}

.panel-header,
.metric-grid,
.run-progress,
.chart-wrapper,
.trend-summary,
.node-list,
.post-list,
.empty-state {
  position: relative;
  z-index: 1;
}

.panel-title {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  letter-spacing: 0;
}

.metric-item,
.trend-summary-item,
.key-node-item,
.post-item,
.empty-state,
.completion-note,
.report-status,
.load-warning {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface-elevated) 80%, transparent), color-mix(in srgb, var(--rl-surface) 42%, transparent));
  border: 1px solid color-mix(in srgb, var(--rl-border) 70%, transparent);
  border-radius: var(--craft-radius);
}

.node-rank {
  background: linear-gradient(135deg, var(--ui-sap), var(--ui-gold));
}

.influence-fill {
  background: linear-gradient(90deg, var(--ui-sap), var(--ui-gold), var(--ui-madder));
}
</style>
