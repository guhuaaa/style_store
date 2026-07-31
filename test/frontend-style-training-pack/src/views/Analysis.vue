<template>
  <div class="analysis-page" :class="{ 'graph-focused': graphFocused }" data-testid="analysis-page">
    <section class="graph-section" data-testid="graph-page">
      <GraphVisualization
        ref="graphVisualization"
        :graph-data="projectStore.graphData"
        :loading="projectStore.loading"
        :show-back="graphFocused"
        @refresh="refreshGraph"
        @back-to-workflow="graphFocused = false"
      />
    </section>

    <aside v-if="!graphFocused" class="workflow-section">
      <div class="workflow-header">
        <el-steps :active="activeStep" finish-status="success" simple>
          <el-step title="数据接入" />
          <el-step title="风险图谱" />
          <el-step title="推演准备" />
          <el-step title="运行查看" />
        </el-steps>
      </div>

      <div class="workflow-body">
        <div v-if="activeStep === 0" class="step-panel">
          <div>
            <h3 class="step-title">风险数据接入</h3>
            <p class="step-desc">
              上传金融舆情、公告、投诉、媒体报道等材料。系统会解析文本，识别关键主体和关系，并形成可用于推演的风险传播图谱。
            </p>
          </div>

          <el-alert
            title="样例文件"
            type="info"
            :closable="false"
            description="可上传仓库 samples/financial_risk_inference_case.md，并使用下方默认分析目标快速验证流程。"
          />

          <el-form label-position="top" class="source-form">
            <el-form-item label="网页 URL">
              <el-input
                v-model="sourceUrl"
                clearable
                placeholder="https://example.com/news/article.html"
                @keyup.enter="startBuild"
              >
                <template #prepend>URL</template>
              </el-input>
            </el-form-item>
          </el-form>

          <div data-testid="file-upload">
            <el-upload
              v-model:file-list="fileList"
              drag
              multiple
              :auto-upload="false"
              accept=".pdf,.txt,.md,.markdown,.html,.htm"
              class="upload-component"
            >
              <el-icon size="48" color="var(--ui-gold)"><UploadFilled /></el-icon>
              <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">可直接输入网页 URL；也可上传 PDF / TXT / Markdown / HTML 文件作为补充材料。</div>
              </template>
            </el-upload>
          </div>

          <el-form label-position="top">
            <el-form-item label="分析目标">
              <el-input
                v-model="requirement"
                data-testid="event-textarea"
                type="textarea"
                :rows="4"
                placeholder="分析理财产品负面舆情在投资者、媒体与监管主体之间的传播路径及风险扩散趋势。"
              />
            </el-form-item>
          </el-form>

          <div class="step-actions">
            <el-button
              data-testid="project-create-button"
              type="primary"
              size="large"
              :loading="projectStore.loading"
              :disabled="!canStartBuild"
              @click="startBuild"
            >
              <el-icon class="mr-2"><Connection /></el-icon>
              解析材料并构建风险图谱
            </el-button>
          </div>
        </div>

        <div v-else-if="activeStep === 1" class="step-panel">
          <div>
            <h3 class="step-title">风险图谱构建</h3>
            <p class="step-desc">
              系统正在将材料中的金融机构、产品、客户、媒体、监管和事件转为主体与关系网络。本地图谱写入状态可在系统日志中查看。
            </p>
          </div>

          <div class="source-summary">
            <div>
              <span>材料来源</span>
              <strong>{{ materialSourceText }}</strong>
            </div>
            <div>
              <span>分析目标</span>
              <strong>{{ requirement || '未填写' }}</strong>
            </div>
          </div>

          <div class="progress-status">
            <el-progress
              :percentage="buildProgress"
              :status="buildStatus"
              :stroke-width="12"
              striped
              striped-flow
            />
            <div class="status-message" :class="{ error: buildStatus === 'exception' }">
              {{ buildMessage }}
            </div>
            <el-alert
              v-if="buildStatus === 'exception'"
              title="构建失败"
              type="error"
              :closable="false"
              :description="projectStore.error || buildMessage"
              show-icon
              class="build-error-alert"
            />
          </div>

          <div class="business-stage-list">
            <div
              v-for="(stage, index) in buildStageItems"
              :key="stage.key"
              class="business-stage-item"
              :class="stage.status"
            >
              <div class="stage-marker">{{ index + 1 }}</div>
              <div class="stage-copy">
                <div class="stage-title">{{ stage.title }}</div>
                <p>{{ stage.desc }}</p>
              </div>
              <StatusBadge :type="stageBadgeType(stage.status)" :text="stageStatusText(stage.status)" />
            </div>
          </div>

          <div v-if="projectStore.hasGraphData" class="entity-summary">
            <DataCard title="关键主体" :value="projectStore.graphData.nodes.length" icon="Share" icon-color="var(--ui-charcoal)" />
            <DataCard title="风险关系" :value="projectStore.graphData.edges.length" icon="Link" icon-color="var(--ui-risk-medium)" />
          </div>

          <div class="step-actions">
            <el-button @click="activeStep = 0">上一步</el-button>
            <el-button
              v-if="projectStore.hasGraphData"
              type="default"
              @click="graphFocused = true"
            >
              全屏分析
            </el-button>
            <el-button
              data-testid="simulation-prepare-button"
              type="primary"
              :disabled="!projectStore.hasGraphData"
              :loading="prepareLoading"
              @click="createAndPrepareSimulation"
            >
              准备风险推演
            </el-button>
          </div>
        </div>

        <div v-else-if="activeStep === 2" class="step-panel">
          <div>
            <h3 class="step-title">推演环境准备</h3>
            <p class="step-desc">
              系统会基于风险图谱生成模拟人群画像，并配置传播场景、推演轮次和平台参数。Agent Profile 等技术细节会保留在日志中。
            </p>
          </div>

          <div class="simulation-meta">
            <div class="meta-row">
              <span>模拟 ID</span>
              <strong>{{ simulationId || '-' }}</strong>
            </div>
            <div class="meta-row">
              <span>状态</span>
              <StatusBadge :type="prepareBadgeType" :text="prepareStatusText" />
            </div>
          </div>

          <div class="progress-status">
            <el-progress
              :percentage="prepareProgress"
              :status="prepareStatus"
              :stroke-width="12"
              striped
              striped-flow
            />
            <div class="status-message">{{ prepareMessage }}</div>
          </div>

          <div class="step-actions">
            <el-button @click="activeStep = 1">上一步</el-button>
            <el-button :loading="prepareLoading" @click="createAndPrepareSimulation">重新准备</el-button>
            <el-button
              data-testid="simulation-start-button"
              type="primary"
              :disabled="!canStartSimulation"
              :loading="startLoading"
              @click="runSimulation"
            >
              开始推演
            </el-button>
          </div>
        </div>

        <div v-else class="step-panel">
          <div class="redirect-hint">
            <el-icon size="48" color="var(--ui-gold)"><VideoPlay /></el-icon>
            <h3>风险推演已启动</h3>
            <p>模拟监控页会从当前模拟读取图谱、Agent、运行轮次和帖子时间线，不再使用静态 mock 数据。</p>
            <el-button type="primary" @click="goToSimulation">查看模拟监控</el-button>
          </div>
        </div>
      </div>

      <div class="log-panel">
        <div class="log-header">
          <span>系统日志</span>
          <el-button link size="small" @click="appStore.clearLogs">清空</el-button>
        </div>
        <div class="log-content">
          <div v-for="(log, idx) in appStore.systemLogs" :key="idx" class="log-item" :class="log.type">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-msg">{{ log.msg }}</span>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Connection, UploadFilled, VideoPlay } from '@element-plus/icons-vue'
import DataCard from '../components/DataCard.vue'
import GraphVisualization from '../components/GraphVisualization.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { buildGraph, checkGraphStorageStatus, generateOntology, getGraphData, getProject, getTaskStatus } from '../api/graph'
import { createSimulation, getPrepareStatus, prepareSimulation, startSimulation } from '../api/simulation'
import { getPendingUpload, clearPendingUpload } from '../store/pendingUpload'
import { useAppStore } from '../stores/app'
import { useProjectStore } from '../stores/project'

const DEFAULT_REQUIREMENT = '分析理财产品负面舆情在投资者、媒体与监管主体之间的传播路径及风险扩散趋势。'
const STORAGE_KEYS = {
  projectId: 'risklens_current_project_id',
  graphId: 'risklens_current_graph_id',
  simulationId: 'risklens_current_simulation_id'
}

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const projectStore = useProjectStore()

const activeStep = ref(0)
const graphFocused = ref(false)
const fileList = ref([])
const sourceUrl = ref('')
const requirement = ref(DEFAULT_REQUIREMENT)
const buildProgress = ref(0)
const buildMessage = ref('等待上传材料')
const buildStatus = ref('')
const prepareProgress = ref(0)
const prepareMessage = ref('等待图谱构建完成')
const prepareStatus = ref('')
const prepareLoading = ref(false)
const startLoading = ref(false)
const simulationId = ref('')
const prepareTaskId = ref('')
const graphVisualization = ref(null)

let graphPollTimer = null
let preparePollTimer = null

const hasMaterialSource = computed(() => fileList.value.length > 0 || sourceUrl.value.trim().length > 0)
const canStartBuild = computed(() => requirement.value.trim().length > 5 && hasMaterialSource.value)
const canStartSimulation = computed(() => !!simulationId.value && prepareProgress.value >= 100 && prepareStatus.value === 'success')
const materialSourceText = computed(() => {
  const parts = []
  if (sourceUrl.value.trim()) parts.push('网页 URL')
  if (fileList.value.length) parts.push(`${fileList.value.length} 个文件`)
  return parts.length ? parts.join(' + ') : '等待材料'
})
const buildStageItems = computed(() => {
  const failed = buildStatus.value === 'exception'
  const stages = [
    { key: 'parse', title: '材料解析', desc: '读取网页或文件正文，提取可分析文本。', threshold: 15 },
    { key: 'entity', title: '主体识别', desc: '识别机构、产品、人物、媒体、监管和事件。', threshold: 35 },
    { key: 'relation', title: '关系识别', desc: '抽取主体之间的影响、传播、监管和关联关系。', threshold: 65 },
    { key: 'graph', title: '风险图谱生成', desc: '写入图数据库并生成可视化关系网络。', threshold: 100 },
    { key: 'ready', title: '可开始推演', desc: '图谱可用后即可准备模拟人群与推演环境。', threshold: 100, requiresGraph: true }
  ]

  return stages.map((stage) => {
    let status = 'waiting'
    if (failed) {
      status = buildProgress.value >= Math.max(stage.threshold - 35, 0) ? 'error' : 'waiting'
    } else if (stage.requiresGraph ? projectStore.hasGraphData : buildProgress.value >= stage.threshold) {
      status = 'success'
    } else if (activeStep.value === 1 && buildProgress.value > Math.max(stage.threshold - 30, 0)) {
      status = 'processing'
    }
    return { ...stage, status }
  })
})
const prepareStatusText = computed(() => {
  if (prepareStatus.value === 'success') return '准备完成'
  if (prepareStatus.value === 'exception') return '准备失败'
  if (prepareLoading.value) return '准备中'
  return '待准备'
})
const prepareBadgeType = computed(() => {
  if (prepareStatus.value === 'success') return 'success'
  if (prepareStatus.value === 'exception') return 'error'
  if (prepareLoading.value) return 'processing'
  return 'default'
})

function stageBadgeType(status) {
  const map = {
    success: 'success',
    processing: 'processing',
    error: 'error',
    waiting: 'default'
  }
  return map[status] || 'default'
}

function stageStatusText(status) {
  const map = {
    success: '完成',
    processing: '处理中',
    error: '异常',
    waiting: '等待'
  }
  return map[status] || status
}

function normalizeSourceUrl(value) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

async function startBuild() {
  if (!canStartBuild.value) {
    ElMessage.warning('请输入网页 URL 或上传文件，并填写分析目标')
    return
  }

  try {
    stopGraphPolling()
    stopPreparePolling()
    projectStore.setLoading(true)
    projectStore.setError('')
    projectStore.setGraphData(null)
    simulationId.value = ''
    prepareTaskId.value = ''
    activeStep.value = 1
    buildProgress.value = 8
    buildStatus.value = ''
    buildMessage.value = '正在检查图数据库连接...'
    appStore.addLog('检查图数据库连接状态')

    await checkGraphStorageStatus()

    buildProgress.value = 8
    buildMessage.value = '正在上传并解析材料...'
    appStore.addLog('图数据库连接正常，开始上传材料并生成图谱本体')

    const formData = new FormData()
    const normalizedSourceUrl = normalizeSourceUrl(sourceUrl.value)
    if (normalizedSourceUrl) {
      formData.append('source_url', normalizedSourceUrl)
    }
    fileList.value.forEach(file => formData.append('files', file.raw))
    formData.append('simulation_requirement', requirement.value.trim())
    formData.append('project_name', `风险推演-${new Date().toLocaleString('zh-CN', { hour12: false })}`)

    const ontologyRes = await generateOntology(formData)
    projectStore.setCurrentProject(ontologyRes.data)
    appStore.addLog(`本体生成完成，项目 ID: ${ontologyRes.data.project_id}`)
    buildProgress.value = 35
    buildMessage.value = '正在生成风险关系图谱...'

    const buildRes = await buildGraph({
      project_id: ontologyRes.data.project_id,
      graph_name: ontologyRes.data.project_name || ontologyRes.data.project_id
    })
    appStore.addLog(`本地图谱构建任务已启动: ${buildRes.data.task_id}`)
    startGraphPolling(buildRes.data.task_id)
  } catch (err) {
    handleBuildError(err)
  } finally {
    projectStore.setLoading(false)
  }
}

function startGraphPolling(taskId) {
  stopGraphPolling()
  graphPollTimer = setInterval(async () => {
    try {
      const res = await getTaskStatus(taskId)
      const task = res.data
      buildProgress.value = Math.min(task.progress || 0, 99)
        buildMessage.value = task.message || '风险图谱构建中...'

      if (task.status === 'completed') {
        stopGraphPolling()
        buildProgress.value = 100
        buildStatus.value = 'success'
        buildMessage.value = '风险图谱构建完成'
        appStore.addLog('风险图谱构建完成')
        await loadGraph()
      } else if (task.status === 'failed') {
        throw new Error(task.error || task.message || '风险图谱构建失败')
      }
    } catch (err) {
      stopGraphPolling()
      handleBuildError(err)
    }
  }, 2000)
}

async function loadGraph() {
  const projectId = projectStore.currentProjectId || route.params.projectId
  if (!projectId || projectId === 'new') return

  const projRes = await getProject(projectId)
  projectStore.setCurrentProject(projRes.data)
  if (!projRes.data.graph_id) return
  persistCurrentContext({
    projectId: projRes.data.project_id || projectId,
    graphId: projRes.data.graph_id
  })

  const graphRes = await getGraphData(projRes.data.graph_id)
  projectStore.setGraphData(graphRes.data)
}

async function createAndPrepareSimulation() {
  if (!projectStore.currentProjectId || !projectStore.currentProject?.graph_id) {
    ElMessage.warning('请先完成本地图谱构建')
    return
  }

  let keepPrepareLoading = false
  try {
    stopPreparePolling()
    prepareLoading.value = true
    activeStep.value = 2
    prepareProgress.value = 5
    prepareStatus.value = ''
    prepareMessage.value = '正在创建风险推演任务...'
    appStore.addLog('开始创建风险推演任务')

    const simRes = await createSimulation({
      project_id: projectStore.currentProjectId,
      graph_id: projectStore.currentProject.graph_id,
      enable_twitter: true,
      enable_reddit: true
    })
    simulationId.value = simRes.data.simulation_id
    projectStore.setCurrentSimulation(simRes.data)
    persistCurrentContext({
      projectId: projectStore.currentProjectId,
      graphId: projectStore.currentProject.graph_id,
      simulationId: simulationId.value
    })
    appStore.addLog(`风险推演任务已创建: ${simulationId.value}`)

    prepareMessage.value = '正在基于风险图谱生成模拟人群与推演配置...'
    const prepareRes = await prepareSimulation({
      simulation_id: simulationId.value,
      // 默认使用 LLM 丰富人设；并发配置与后端全局上限统一为 8。
      use_llm_for_profiles: true,
      parallel_profile_count: 8
    })

    if (prepareRes.data.already_prepared || prepareRes.data.status === 'ready') {
      markPrepareReady(prepareRes.data.message || '推演环境已准备完成')
      return
    }

    prepareTaskId.value = prepareRes.data.task_id
    startPreparePolling()
    keepPrepareLoading = true
  } catch (err) {
    prepareStatus.value = 'exception'
    prepareMessage.value = err.message
    appStore.addLog(`推演准备失败: ${err.message}`, 'error')
    ElMessage.error(err.message)
  } finally {
    if (!keepPrepareLoading) {
      prepareLoading.value = false
    }
  }
}

function startPreparePolling() {
  stopPreparePolling()
  prepareLoading.value = true
  preparePollTimer = setInterval(async () => {
    try {
      const res = await getPrepareStatus({
        task_id: prepareTaskId.value,
        simulation_id: simulationId.value
      })
      const task = res.data
      prepareProgress.value = Math.min(task.progress || 0, 99)
      prepareMessage.value = task.message || '推演环境准备中...'

      if (['completed', 'ready'].includes(task.status) || task.already_prepared) {
        markPrepareReady(task.message || '推演环境准备完成')
      } else if (task.status === 'failed') {
        throw new Error(task.error || task.message || '推演环境准备失败')
      }
    } catch (err) {
      stopPreparePolling()
      prepareStatus.value = 'exception'
      prepareLoading.value = false
      prepareMessage.value = err.message
      appStore.addLog(`推演准备失败: ${err.message}`, 'error')
    }
  }, 2500)
}

function markPrepareReady(message) {
  stopPreparePolling()
  prepareLoading.value = false
  prepareProgress.value = 100
  prepareStatus.value = 'success'
  prepareMessage.value = message
  appStore.addLog('推演环境准备完成')
}

async function runSimulation() {
  if (!simulationId.value) return

  try {
    startLoading.value = true
    const res = await startSimulation({
      simulation_id: simulationId.value,
      platform: 'parallel',
      max_rounds: 5,
      enable_graph_memory_update: true
    })
    projectStore.setCurrentSimulation(res.data)
    persistCurrentContext({
      projectId: projectStore.currentProjectId,
      graphId: projectStore.currentProject?.graph_id,
      simulationId: simulationId.value
    })
    appStore.addLog(`风险推演已启动: ${simulationId.value}`)
    ElMessage.success('风险推演已启动')
    activeStep.value = 3
    goToSimulation()
  } catch (err) {
    appStore.addLog(`启动推演失败: ${err.message}`, 'error')
    ElMessage.error(err.message)
  } finally {
    startLoading.value = false
  }
}

function goToSimulation() {
  if (simulationId.value) {
    persistCurrentContext({
      projectId: projectStore.currentProjectId,
      graphId: projectStore.currentProject?.graph_id,
      simulationId: simulationId.value
    })
    router.push(`/simulation/${simulationId.value}`)
  }
}

function persistCurrentContext({ projectId, graphId, simulationId: id }) {
  if (projectId) localStorage.setItem(STORAGE_KEYS.projectId, projectId)
  if (graphId) localStorage.setItem(STORAGE_KEYS.graphId, graphId)
  if (id) localStorage.setItem(STORAGE_KEYS.simulationId, id)
}

function refreshGraph() {
  loadGraph().catch(err => {
    appStore.addLog(`刷新图谱失败: ${err.message}`, 'error')
  })
}

async function focusRouteEvidence() {
  const sourceType = String(route.query.evidenceType || '')
  const sourceId = String(route.query.evidenceId || '')
  if (!sourceType || !sourceId || !projectStore.hasGraphData) return
  await nextTick()
  const focused = graphVisualization.value?.focusEvidence(sourceType, sourceId)
  if (!focused) {
    ElMessage.warning('图谱中未找到该证据，数据可能已更新。')
  } else {
    graphFocused.value = true
  }
}

function handleBuildError(err) {
  projectStore.setError(err.message)
  buildStatus.value = 'exception'
  buildMessage.value = err.message
  appStore.addLog(`图谱构建失败: ${err.message}`, 'error')
  ElMessage.error(err.message)
}

function stopGraphPolling() {
  if (graphPollTimer) {
    clearInterval(graphPollTimer)
    graphPollTimer = null
  }
}

function stopPreparePolling() {
  if (preparePollTimer) {
    clearInterval(preparePollTimer)
    preparePollTimer = null
  }
}

onMounted(async () => {
  const pending = getPendingUpload()
  if (pending.isPending && pending.files.length > 0) {
    fileList.value = pending.files.map(file => ({ name: file.name, raw: file }))
    requirement.value = pending.simulationRequirement || DEFAULT_REQUIREMENT
    clearPendingUpload()
  }

  if (route.params.projectId && route.params.projectId !== 'new') {
    projectStore.setCurrentProject({ project_id: route.params.projectId })
    activeStep.value = 1
    try {
      await loadGraph()
      if (projectStore.hasGraphData) {
        buildProgress.value = 100
        buildStatus.value = 'success'
                buildMessage.value = '已加载现有风险图谱'
      }
    } catch (err) {
      appStore.addLog(`加载项目失败: ${err.message}`, 'error')
    }
  }
})

watch(
  () => [projectStore.graphData, route.query.evidenceType, route.query.evidenceId],
  focusRouteEvidence
)

onUnmounted(() => {
  stopGraphPolling()
  stopPreparePolling()
})
</script>

<style scoped>
.analysis-page {
  display: flex;
  gap: 20px;
  height: calc(100vh - 112px);
}

.graph-section {
  flex: 1.2;
  min-width: 0;
  height: 100%;
}

.analysis-page.graph-focused .graph-section {
  flex: 1;
  width: 100%;
}

.workflow-section {
  flex: 1;
  min-width: 420px;
  max-width: 540px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.workflow-header,
.workflow-body,
.log-panel {
  background-color: var(--rl-surface);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
}

.workflow-header {
  padding: 12px;
}

.workflow-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.step-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-title {
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--rl-text-primary);
  margin: 0 0 8px;
}

.step-desc {
  font-size: 0.88rem;
  color: var(--rl-text-secondary);
  line-height: 1.7;
  margin: 0;
}

.upload-component,
.upload-component :deep(.el-upload) {
  width: 100%;
}

.upload-component :deep(.el-upload-dragger) {
  width: 100%;
  background-color: var(--rl-surface-elevated);
  border-color: var(--rl-border);
  color: var(--rl-text-secondary);
}

.upload-component :deep(.el-upload-dragger:hover) {
  border-color: var(--rl-gold);
}

.upload-component :deep(.el-upload__tip) {
  color: var(--rl-text-muted);
}

.progress-status {
  padding: 20px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.source-summary {
  display: grid;
  grid-template-columns: 0.9fr 1.4fr;
  gap: 12px;
}

.source-summary > div {
  padding: 12px;
  background-color: var(--rl-surface-elevated);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
  min-width: 0;
}

.source-summary span {
  display: block;
  color: var(--rl-text-muted);
  font-size: 0.75rem;
  margin-bottom: 6px;
}

.source-summary strong {
  display: block;
  color: var(--rl-text-primary);
  font-size: 0.85rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.business-stage-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.business-stage-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background-color: var(--rl-surface-elevated);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
}

.business-stage-item.success {
  border-color: rgba(42, 157, 143, 0.35);
}

.business-stage-item.processing {
  border-color: rgba(212, 175, 55, 0.45);
}

.business-stage-item.error {
  border-color: rgba(230, 57, 70, 0.45);
}

.stage-marker {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--rl-border);
  color: var(--rl-text-primary);
  font-size: 0.75rem;
  font-weight: 700;
}

.business-stage-item.success .stage-marker {
  background-color: var(--rl-safe);
  color: white;
}

.business-stage-item.processing .stage-marker {
  background-color: var(--rl-gold);
  color: white;
}

.business-stage-item.error .stage-marker {
  background-color: var(--rl-risk);
  color: white;
}

.stage-copy {
  flex: 1;
  min-width: 0;
}

.stage-title {
  color: var(--rl-text-primary);
  font-size: 0.88rem;
  font-weight: 600;
}

.stage-copy p {
  margin: 4px 0 0;
  color: var(--rl-text-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}

.status-message {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--rl-text-secondary);
  line-height: 1.5;
}

.status-message.error {
  color: var(--el-color-error);
  font-weight: 600;
}

.build-error-alert {
  margin-top: 12px;
}

.entity-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.simulation-meta {
  display: grid;
  gap: 10px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
  color: var(--rl-text-secondary);
  font-size: 0.85rem;
}

.meta-row strong {
  color: var(--rl-text-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
  text-align: right;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}

.redirect-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.redirect-hint h3 {
  margin: 0;
  color: var(--rl-text-primary);
}

.redirect-hint p {
  max-width: 380px;
  color: var(--rl-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}

.log-panel {
  height: 160px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--rl-border);
  font-size: 0.8rem;
  color: var(--rl-text-secondary);
}

.log-content {
  flex: 1;
  overflow-y: auto;
  padding: 10px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
}

.log-item {
  display: flex;
  gap: 10px;
  color: var(--rl-text-secondary);
  margin-bottom: 4px;
}

.log-item.error .log-msg {
  color: var(--rl-risk);
}

.log-time {
  color: var(--rl-text-muted);
  flex-shrink: 0;
}

.log-msg {
  color: var(--rl-text-secondary);
}

.mr-2 {
  margin-right: 8px;
}

@media (max-width: 1280px) {
  .analysis-page {
    flex-direction: column;
    height: auto;
  }

  .analysis-page.graph-focused {
    flex-direction: row;
    height: calc(100vh - 112px);
  }

  .graph-section,
  .workflow-section {
    width: 100%;
    max-width: none;
    min-width: 0;
  }

  .graph-section {
    height: 520px;
  }

  .analysis-page.graph-focused .graph-section {
    height: 100%;
  }
}

@media (max-width: 720px) {
  .source-summary {
    grid-template-columns: 1fr;
  }
}

.workflow-section,
.log-panel {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 94%, transparent), color-mix(in srgb, var(--ui-paper) 22%, var(--rl-surface))),
    var(--craft-fiber);
  border: 1px solid var(--rl-border);
  border-radius: var(--craft-radius);
  box-shadow: var(--craft-shadow-soft);
}

.workflow-section::before,
.log-panel::before {
  content: "";
  position: absolute;
  inset: 7px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--rl-border) 58%, transparent);
  border-radius: 3px;
}

.workflow-header,
.workflow-body,
.log-header,
.log-content {
  position: relative;
  z-index: 1;
}

.step-title {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  letter-spacing: 0;
}

.source-summary,
.simulation-meta,
.business-stage-item,
.entity-summary,
.redirect-hint {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface-elevated) 80%, transparent), color-mix(in srgb, var(--rl-surface) 42%, transparent));
  border: 1px solid color-mix(in srgb, var(--rl-border) 70%, transparent);
  border-radius: var(--craft-radius);
}

.stage-marker {
  background: color-mix(in srgb, var(--ui-sap) 18%, var(--rl-surface));
  border: 1px solid color-mix(in srgb, var(--ui-sap) 42%, transparent);
  color: var(--ui-sap);
}
</style>
