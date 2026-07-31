<template>
  <section class="analysis-panel" aria-labelledby="analysis-panel-title">
    <header class="analysis-header">
      <div>
        <p class="analysis-kicker">STRUCTURED ASSESSMENT · 结构化研判</p>
        <h2 id="analysis-panel-title">风险态势与处置台账</h2>
        <p class="analysis-caption">确定性指标负责评分，模型只解释指标并生成待复核建议。</p>
      </div>
      <button
        class="refresh-button"
        type="button"
        :disabled="loading || !simulationId"
        @click="startAnalysis(true)"
      >
        {{ loading ? '研判中' : '重新研判' }}
      </button>
    </header>

    <div v-if="!simulationId" class="analysis-state">
      当前报告未关联仿真，暂时无法生成结构化研判。
    </div>
    <div v-else-if="loading && !result" class="analysis-state loading-state">
      <span class="loading-rule" aria-hidden="true"></span>
      正在计算传播、情绪、主体、监管与商业影响五维指标
    </div>
    <div v-else-if="errorMessage && !result" class="analysis-state error-state">
      <strong>研判未完成</strong>
      <span>{{ errorMessage }}</span>
      <button type="button" @click="retry">重试</button>
    </div>

    <template v-else-if="result">
      <div v-if="result.warnings?.length" class="warning-strip" role="status">
        <span>PARTIAL</span>
        <p>{{ result.warnings.join('；') }}</p>
      </div>

      <nav class="analysis-tabs" aria-label="结构化分析栏目">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </nav>

      <div v-if="activeTab === 'situation'" class="tab-content">
        <div class="assessment-lead">
          <div class="risk-register" :data-level="assessment.overall_level">
            <span class="risk-label">综合风险指数</span>
            <strong>{{ formatScore(assessment.overall_score) }}</strong>
            <span class="risk-level">{{ levelLabel(assessment.overall_level) }}</span>
            <small>{{ assessment.score_formula_version }}</small>
          </div>
          <div class="assessment-copy">
            <p>{{ assessment.summary }}</p>
            <dl class="metric-ledger">
              <div><dt>图谱规模</dt><dd>{{ metrics.node_count }} 节点 / {{ metrics.edge_count }} 关系</dd></div>
              <div><dt>传播覆盖</dt><dd>{{ percent(metrics.propagation_coverage) }}</dd></div>
              <div><dt>负面行动</dt><dd>{{ percent(metrics.negative_action_ratio) }}</dd></div>
              <div><dt>峰值轮次</dt><dd>{{ metrics.peak_round ? `第 ${metrics.peak_round} 轮` : '数据不足' }}</dd></div>
            </dl>
          </div>
        </div>

        <div class="dimension-grid">
          <article v-for="dimension in assessment.dimensions" :key="dimension.name" class="dimension-row">
            <div class="dimension-heading">
              <span>{{ dimension.name }}</span>
              <strong>{{ formatScore(dimension.score) }}</strong>
            </div>
            <div class="score-track" aria-hidden="true">
              <i :style="{ width: `${dimension.score}%` }"></i>
            </div>
            <p>{{ dimension.reason }}</p>
            <div v-if="dimension.evidence?.length" class="evidence-links">
              <button
                v-for="item in dimension.evidence"
                :key="`${item.source_type}-${item.source_id}`"
                type="button"
                @click="selectEvidence(item)"
              >
                {{ evidenceLabel(item) }}
              </button>
            </div>
          </article>
        </div>

        <div class="analysis-columns">
          <section>
            <h3>关键主体</h3>
            <div v-if="assessment.key_entities?.length" class="entity-list">
              <button
                v-for="entity in assessment.key_entities.slice(0, 6)"
                :key="entity.entity_id"
                type="button"
                @click="selectEvidence(entity.evidence?.[0])"
              >
                <span>{{ entity.name }}</span>
                <small>{{ entity.role }}</small>
                <strong>{{ formatScore(entity.score) }}</strong>
              </button>
            </div>
            <p v-else class="empty-note">暂无足够关系数据识别关键主体。</p>
          </section>

          <section>
            <h3>相似公开案例</h3>
            <div v-if="result.matched_cases?.length" class="case-list">
              <button
                v-for="item in result.matched_cases.slice(0, 5)"
                :key="item.case_id"
                type="button"
                @click="openCaseSource(item.case_id)"
              >
                <span>{{ item.title }}</span>
                <strong>相似度 {{ percent(item.similarity) }}</strong>
                <small>{{ item.reasons?.slice(0, 2).join('；') || '按显式特征加权匹配' }}</small>
              </button>
            </div>
            <p v-else class="empty-note">当前特征未匹配到可解释的公开案例。</p>
          </section>
        </div>
      </div>

      <div v-else-if="activeTab === 'response'" class="tab-content">
        <div class="strategy-note">
          <span>总体策略</span>
          <p>{{ result.response_suggestion.strategy }}</p>
        </div>
        <div class="action-ledger">
          <article
            v-for="action in result.response_suggestion.actions"
            :key="`${action.priority}-${action.title}`"
            :data-priority="action.priority"
          >
            <div class="priority-stamp">{{ action.priority }}</div>
            <div class="action-body">
              <h3>{{ action.title }}</h3>
              <p>{{ action.description }}</p>
              <dl>
                <div><dt>负责方</dt><dd>{{ action.owner }}</dd></div>
                <div><dt>期限</dt><dd>{{ action.deadline }}</dd></div>
                <div><dt>预期效果</dt><dd>{{ action.expected_effect }}</dd></div>
              </dl>
              <div v-if="action.evidence?.length" class="evidence-links">
                <button
                  v-for="item in action.evidence"
                  :key="`${item.source_type}-${item.source_id}`"
                  type="button"
                  @click="selectEvidence(item)"
                >
                  {{ evidenceLabel(item) }}
                </button>
              </div>
            </div>
          </article>
        </div>
        <section class="communication-points">
          <h3>沟通要点</h3>
          <ul>
            <li v-for="item in result.response_suggestion.communication_points" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>

      <div v-else-if="activeTab === 'management'" class="tab-content management-grid">
        <section v-for="group in managementGroups" :key="group.title">
          <span>{{ group.code }}</span>
          <h3>{{ group.title }}</h3>
          <ul>
            <li v-for="item in group.items" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>

      <CaseLibraryPanel v-else class="tab-content" />

      <footer class="analysis-footer">
        <span>{{ result.status === 'partial' ? '部分生成' : '分析完成' }}</span>
        <span>生成于 {{ formatDate(result.generated_at) }}</span>
        <span>所有建议均需人工复核</span>
      </footer>
    </template>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import CaseLibraryPanel from './CaseLibraryPanel.vue'
import {
  getCase,
  getOpinionAnalysis,
  getOpinionAnalysisStatus,
  retryOpinionAnalysis,
  runOpinionAnalysis
} from '../../api/analysis'

const props = defineProps({
  simulationId: { type: String, default: '' }
})

const emit = defineEmits(['evidence-select'])
const tabs = [
  { key: 'situation', label: '态势评估' },
  { key: 'response', label: '处置建议' },
  { key: 'management', label: '管理建议' },
  { key: 'library', label: '公开案例库' }
]
const activeTab = ref('situation')
const loading = ref(false)
const errorMessage = ref('')
const analysisId = ref('')
const result = ref(null)
let pollTimer = null
let requestToken = 0

const assessment = computed(() => result.value?.situational_assessment || {})
const metrics = computed(() => assessment.value.metrics || {})
const managementGroups = computed(() => {
  const source = result.value?.management_suggestion || {}
  return [
    { code: 'M1', title: '监测重点', items: source.monitoring_priorities || [] },
    { code: 'M2', title: '流程改进', items: source.process_improvements || [] },
    { code: 'M3', title: '资源配置', items: source.resource_allocation || [] },
    { code: 'M4', title: '长期预防', items: source.long_term_prevention || [] }
  ]
})

function clearPoll() {
  if (pollTimer) window.clearTimeout(pollTimer)
  pollTimer = null
}

async function startAnalysis(force = false) {
  if (!props.simulationId) return
  const token = ++requestToken
  clearPoll()
  loading.value = true
  errorMessage.value = ''
  if (force) result.value = null
  try {
    const response = await runOpinionAnalysis({
      simulation_id: props.simulationId,
      force_regenerate: force
    })
    if (token !== requestToken) return
    analysisId.value = response.data.analysis_id
    if (['completed', 'partial'].includes(response.data.status)) {
      await loadResult(token)
    } else if (response.data.status === 'failed') {
      errorMessage.value = '上一次研判失败，可点击重新研判。'
      loading.value = false
    } else {
      schedulePoll(token)
    }
  } catch (error) {
    if (token !== requestToken) return
    errorMessage.value = error.message || '结构化研判启动失败'
    loading.value = false
  }
}

function schedulePoll(token) {
  clearPoll()
  pollTimer = window.setTimeout(() => pollStatus(token), 1200)
}

async function pollStatus(token) {
  if (!analysisId.value || token !== requestToken) return
  try {
    const response = await getOpinionAnalysisStatus(analysisId.value)
    if (token !== requestToken) return
    const status = response.data.status
    if (['completed', 'partial'].includes(status)) {
      await loadResult(token)
    } else if (status === 'failed') {
      errorMessage.value = response.data.error || '结构化研判失败'
      loading.value = false
    } else {
      schedulePoll(token)
    }
  } catch (error) {
    if (token !== requestToken) return
    errorMessage.value = error.message || '研判状态读取失败'
    loading.value = false
  }
}

async function loadResult(token = requestToken) {
  const response = await getOpinionAnalysis(analysisId.value)
  if (token !== requestToken) return
  result.value = response.data.result_json
  loading.value = false
}

async function retry() {
  if (!analysisId.value) {
    await startAnalysis(true)
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    await retryOpinionAnalysis(analysisId.value)
    schedulePoll(requestToken)
  } catch (error) {
    errorMessage.value = error.message || '重试失败'
    loading.value = false
  }
}

function selectEvidence(item) {
  if (!item) return
  emit('evidence-select', item)
  ElMessage.info(`已定位证据：${evidenceLabel(item)}`)
}

async function openCaseSource(caseId) {
  try {
    const response = await getCase(caseId)
    const url = response.data.sources?.[0]?.url
    if (!url) throw new Error('案例缺少公开来源')
    window.open(url, '_blank', 'noopener,noreferrer')
  } catch (error) {
    ElMessage.error(error.message || '案例来源打开失败')
  }
}

function formatScore(value) {
  return Number(value || 0).toFixed(1)
}

function percent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`
}

function levelLabel(level) {
  return { low: '低风险', medium: '中风险', high: '高风险', critical: '重大风险' }[level] || '待评估'
}

function evidenceLabel(item) {
  const labels = {
    graph_node: '图谱节点',
    graph_edge: '图谱关系',
    simulation_action: '仿真行动',
    case_source: '案例来源'
  }
  return `${labels[item.source_type] || '证据'} · ${item.source_id}`
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

watch(
  () => props.simulationId,
  () => {
    requestToken += 1
    result.value = null
    analysisId.value = ''
    errorMessage.value = ''
    clearPoll()
    startAnalysis()
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  requestToken += 1
  clearPoll()
})
</script>

<style scoped>
.analysis-panel {
  --analysis-ink: var(--rl-text-primary);
  --analysis-muted: var(--rl-text-muted);
  --analysis-rule: var(--rl-border);
  --analysis-paper: var(--rl-surface);
  --analysis-lift: var(--rl-surface-elevated);
  --analysis-gold: var(--ui-gold);
  margin: 4px 0 30px;
  border-block: 1px solid var(--analysis-rule);
  color: var(--analysis-ink);
}

.analysis-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 0 18px;
}

.analysis-kicker {
  margin: 0 0 7px;
  color: var(--analysis-gold);
  font: 650 0.68rem/1.2 'Inter', 'Noto Sans SC', sans-serif;
  letter-spacing: 0.16em;
}

.analysis-header h2 {
  margin: 0;
  font: 650 1.28rem/1.35 'Noto Serif SC', 'Songti SC', serif;
  letter-spacing: 0.02em;
}

.analysis-caption {
  margin: 7px 0 0;
  color: var(--analysis-muted);
  font-size: 0.78rem;
  line-height: 1.6;
}

.refresh-button,
.analysis-state button {
  border: 1px solid var(--analysis-rule);
  background: transparent;
  color: var(--analysis-ink);
  padding: 8px 13px;
  font-size: 0.76rem;
  cursor: pointer;
}

.refresh-button:hover,
.analysis-state button:hover {
  border-color: var(--analysis-gold);
  color: var(--analysis-gold);
}

.refresh-button:focus-visible,
.analysis-tabs button:focus-visible,
.evidence-links button:focus-visible,
.entity-list button:focus-visible,
.case-list button:focus-visible {
  outline: 2px solid var(--analysis-gold);
  outline-offset: 2px;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: wait;
}

.analysis-state {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--analysis-muted);
  font-size: 0.84rem;
  border-top: 1px solid var(--analysis-rule);
}

.loading-rule {
  width: 46px;
  height: 1px;
  background: var(--analysis-gold);
  animation: scan 1.2s ease-in-out infinite alternate;
  transform-origin: left;
}

.error-state {
  flex-direction: column;
}

.error-state strong {
  color: var(--analysis-ink);
}

.warning-strip {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 14px;
  padding: 10px 0;
  border-top: 1px solid var(--analysis-rule);
  color: var(--analysis-muted);
  font-size: 0.76rem;
}

.warning-strip span {
  color: var(--analysis-gold);
  font-weight: 700;
  letter-spacing: 0.12em;
}

.warning-strip p {
  margin: 0;
}

.analysis-tabs {
  display: flex;
  gap: 28px;
  border-top: 1px solid var(--analysis-rule);
  border-bottom: 1px solid var(--analysis-rule);
}

.analysis-tabs button {
  position: relative;
  border: 0;
  background: transparent;
  color: var(--analysis-muted);
  padding: 12px 0;
  font-size: 0.82rem;
  cursor: pointer;
}

.analysis-tabs button.active {
  color: var(--analysis-ink);
  font-weight: 650;
}

.analysis-tabs button.active::after {
  content: '';
  position: absolute;
  inset: auto 0 -1px;
  height: 2px;
  background: var(--analysis-gold);
}

.tab-content {
  padding: 24px 0;
}

.assessment-lead {
  display: grid;
  grid-template-columns: minmax(170px, 0.32fr) 1fr;
  gap: 34px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--analysis-rule);
}

.risk-register {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 154px;
  padding-left: 24px;
  overflow: hidden;
}

.risk-register::before {
  content: '';
  position: absolute;
  inset: 3px auto 3px 0;
  width: 8px;
  border-left: 2px solid var(--analysis-gold);
  background: repeating-linear-gradient(
    to bottom,
    var(--analysis-gold) 0 1px,
    transparent 1px 12px
  );
  opacity: 0.75;
}

.risk-label {
  color: var(--analysis-muted);
  font-size: 0.72rem;
}

.risk-register strong {
  margin-top: 8px;
  font: 600 clamp(3.2rem, 7vw, 5rem)/0.92 'Iowan Old Style', 'Noto Serif SC', serif;
  letter-spacing: -0.06em;
}

.risk-level {
  margin-top: 12px;
  color: var(--analysis-gold);
  font-weight: 700;
  font-size: 0.82rem;
}

.risk-register small {
  margin-top: auto;
  color: var(--analysis-muted);
  font-size: 0.65rem;
}

.assessment-copy > p {
  margin: 0;
  max-width: 72ch;
  font: 500 0.94rem/1.9 'Noto Serif SC', 'Songti SC', serif;
}

.metric-ledger {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 24px;
  margin: 18px 0 0;
}

.metric-ledger div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid var(--analysis-rule);
}

.metric-ledger dt,
.metric-ledger dd {
  margin: 0;
  font-size: 0.74rem;
}

.metric-ledger dt {
  color: var(--analysis-muted);
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  border-bottom: 1px solid var(--analysis-rule);
}

.dimension-row {
  padding: 18px 16px 18px 0;
  border-right: 1px solid var(--analysis-rule);
}

.dimension-row + .dimension-row {
  padding-left: 16px;
}

.dimension-row:last-child {
  border-right: 0;
}

.dimension-heading {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.78rem;
}

.dimension-heading strong {
  font-family: 'Iowan Old Style', serif;
}

.score-track {
  height: 2px;
  margin: 10px 0 12px;
  background: var(--analysis-rule);
}

.score-track i {
  display: block;
  height: 100%;
  background: var(--analysis-gold);
}

.dimension-row p {
  min-height: 50px;
  margin: 0;
  color: var(--analysis-muted);
  font-size: 0.69rem;
  line-height: 1.55;
}

.evidence-links {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.evidence-links button {
  max-width: 100%;
  border: 0;
  border-bottom: 1px dotted var(--analysis-muted);
  background: transparent;
  color: var(--analysis-muted);
  padding: 2px 0;
  font-size: 0.63rem;
  text-overflow: ellipsis;
  overflow: hidden;
  cursor: pointer;
}

.evidence-links button:hover {
  color: var(--analysis-gold);
  border-color: var(--analysis-gold);
}

.analysis-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 34px;
  padding-top: 24px;
}

.analysis-columns h3,
.communication-points h3,
.management-grid h3 {
  margin: 0 0 12px;
  font: 650 0.82rem/1.4 'Noto Serif SC', serif;
}

.entity-list,
.case-list {
  border-top: 1px solid var(--analysis-rule);
}

.entity-list button,
.case-list button {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3px 12px;
  border: 0;
  border-bottom: 1px solid var(--analysis-rule);
  background: transparent;
  color: var(--analysis-ink);
  padding: 10px 0;
  text-align: left;
  cursor: pointer;
}

.entity-list button:hover,
.case-list button:hover {
  color: var(--analysis-gold);
}

.entity-list small {
  grid-column: 1;
  color: var(--analysis-muted);
  font-size: 0.66rem;
}

.entity-list strong {
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
  font-family: 'Iowan Old Style', serif;
}

.case-list strong {
  color: var(--analysis-muted);
  font-size: 0.68rem;
  font-weight: 500;
}

.case-list small {
  grid-column: 1 / -1;
  color: var(--analysis-muted);
  font-size: 0.62rem;
  line-height: 1.5;
}

.empty-note {
  color: var(--analysis-muted);
  font-size: 0.75rem;
}

.strategy-note {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 18px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--analysis-rule);
}

.strategy-note span {
  color: var(--analysis-gold);
  font-size: 0.72rem;
  font-weight: 700;
}

.strategy-note p {
  margin: 0;
  font: 500 0.92rem/1.8 'Noto Serif SC', serif;
}

.action-ledger article {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 18px;
  padding: 22px 0;
  border-bottom: 1px solid var(--analysis-rule);
}

.priority-stamp {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--analysis-gold);
  color: var(--analysis-gold);
  font: 700 0.76rem/1 'Inter', sans-serif;
}

.action-body h3 {
  margin: 0 0 7px;
  font-size: 0.9rem;
}

.action-body > p {
  margin: 0;
  color: var(--analysis-muted);
  font-size: 0.78rem;
  line-height: 1.7;
}

.action-body dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 14px 0 0;
}

.action-body dl div {
  border-left: 1px solid var(--analysis-rule);
  padding-left: 10px;
}

.action-body dt {
  color: var(--analysis-muted);
  font-size: 0.64rem;
}

.action-body dd {
  margin: 3px 0 0;
  font-size: 0.72rem;
  line-height: 1.45;
}

.communication-points {
  padding-top: 22px;
}

.communication-points ul,
.management-grid ul {
  margin: 0;
  padding-left: 18px;
}

.communication-points li,
.management-grid li {
  margin: 7px 0;
  color: var(--analysis-muted);
  font-size: 0.76rem;
  line-height: 1.65;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0;
  padding: 0;
}

.management-grid section {
  min-height: 170px;
  padding: 24px;
  border-right: 1px solid var(--analysis-rule);
  border-bottom: 1px solid var(--analysis-rule);
}

.management-grid section:nth-child(2n) {
  border-right: 0;
}

.management-grid section > span {
  display: block;
  margin-bottom: 18px;
  color: var(--analysis-gold);
  font: 700 0.66rem/1 'Inter', sans-serif;
  letter-spacing: 0.12em;
}

.analysis-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid var(--analysis-rule);
  color: var(--analysis-muted);
  font-size: 0.65rem;
}

@keyframes scan {
  from { transform: scaleX(0.25); opacity: 0.35; }
  to { transform: scaleX(1); opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .loading-rule { animation: none; }
}

@media (max-width: 1100px) {
  .dimension-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dimension-row:nth-child(2n) {
    border-right: 0;
  }

  .dimension-row:nth-child(n + 3) {
    border-top: 1px solid var(--analysis-rule);
  }
}

@media (max-width: 680px) {
  .analysis-header,
  .assessment-lead,
  .analysis-columns,
  .strategy-note {
    grid-template-columns: 1fr;
  }

  .analysis-header {
    display: grid;
  }

  .refresh-button {
    justify-self: start;
  }

  .assessment-lead {
    gap: 20px;
  }

  .dimension-grid,
  .management-grid {
    grid-template-columns: 1fr;
  }

  .dimension-row,
  .dimension-row + .dimension-row,
  .management-grid section {
    padding: 16px 0;
    border-right: 0;
    border-top: 1px solid var(--analysis-rule);
  }

  .action-ledger article {
    grid-template-columns: 48px 1fr;
    gap: 12px;
  }

  .action-body dl,
  .metric-ledger {
    grid-template-columns: 1fr;
  }

  .analysis-footer {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
