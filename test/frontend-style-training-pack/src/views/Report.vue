<template>
  <div class="report-page" data-testid="report-page">
    <el-row :gutter="20">
      <el-col :xs="24" :lg="16">
        <div class="content-card report-card">
          <div class="card-header">
            <div class="header-copy">
              <h3 class="card-title">{{ reportTitle }}</h3>
              <p class="card-subtitle">{{ reportSubtitle }}</p>
            </div>
            <div class="header-actions">
              <el-button :icon="RefreshRight" size="small" :loading="loading" @click="loadReport">
                刷新
              </el-button>
              <el-button
                :icon="Download"
                size="small"
                :disabled="!activeReportId"
                :loading="downloading"
                @click="downloadCurrentReport"
              >
                下载 Markdown
              </el-button>
            </div>
          </div>

          <el-skeleton v-if="loading" :rows="12" animated />
          <el-alert v-else-if="loadError" :title="loadError" type="error" show-icon :closable="false" />

          <template v-else>
            <el-alert
              v-if="report && report.status !== 'completed'"
              :title="statusHint"
              type="warning"
              show-icon
              :closable="false"
              class="status-alert"
            />

            <AnalysisPanel
              :simulation-id="report?.simulation_id || ''"
              @evidence-select="handleAnalysisEvidence"
            />

            <div v-if="reportBlocks.length" class="report-content" data-testid="report-content">
              <template v-for="(block, index) in reportBlocks" :key="index">
                <component
                  :is="block.tag"
                  v-if="block.type === 'heading'"
                  class="report-heading"
                >
                  {{ block.text }}
                </component>
                <p v-else-if="block.type === 'paragraph'" class="report-paragraph">
                  {{ block.text }}
                </p>
                <blockquote v-else-if="block.type === 'quote'" class="report-quote">
                  {{ block.text }}
                </blockquote>
                <component :is="block.ordered ? 'ol' : 'ul'" v-else-if="block.type === 'list'" class="report-list">
                  <li v-for="(item, itemIndex) in block.items" :key="itemIndex">{{ item }}</li>
                </component>
                <pre v-else-if="block.type === 'code'" class="report-code">{{ block.text }}</pre>
              </template>
            </div>

            <div v-else class="empty-state">
              暂无报告正文。请先在仿真监控页生成分析报告。
            </div>
          </template>
        </div>
      </el-col>

      <el-col :xs="24" :lg="8">
        <div class="content-card side-panel">
          <div class="card-header compact">
            <h3 class="card-title">风险指数</h3>
          </div>
          <div class="gauge-wrapper">
            <RiskGaugeChart :value="riskGaugeValue" title="舆情风险" />
          </div>
          <div class="risk-meta">
            <span>{{ report?.status || 'unknown' }}</span>
            <span>{{ report?.completed_at || report?.created_at || '-' }}</span>
          </div>
        </div>

        <div class="content-card side-panel mt-4">
          <div class="card-header compact">
            <h3 class="card-title">报告章节</h3>
          </div>
          <div v-if="sectionSummaries.length" class="section-list">
            <div v-for="(section, index) in sectionSummaries" :key="`${section.title}-${index}`" class="section-item">
              <span class="section-index">{{ index + 1 }}</span>
              <div>
                <div class="section-title">{{ section.title }}</div>
                <p>{{ section.preview }}</p>
              </div>
            </div>
          </div>
          <div v-else class="small-empty">暂无章节大纲</div>
        </div>

        <div class="content-card side-panel mt-4">
          <div class="card-header compact">
            <h3 class="card-title">结论证据链</h3>
          </div>
          <div v-if="evidenceItems.length" class="evidence-list">
            <div v-for="item in evidenceItems" :key="item.id" class="evidence-item">
              <div class="evidence-topline">
                <span>{{ item.type }}</span>
                <strong>{{ item.confidence }}</strong>
              </div>
              <p>{{ item.excerpt }}</p>
              <div class="evidence-meta">{{ item.source }}</div>
            </div>
          </div>
          <div v-else class="small-empty">
            暂未识别到可结构化展示的证据。建议后续让 Report Agent 输出 evidence 字段，以支持精确跳转。
          </div>
          <div v-if="uncertaintyItems.length" class="uncertainty-box">
            <div class="uncertainty-title">不确定性提示</div>
            <p v-for="item in uncertaintyItems" :key="item.id">{{ item.text }}</p>
          </div>
        </div>

        <div class="content-card side-panel mt-4">
          <div class="card-header compact">
            <h3 class="card-title">专家深度研判</h3>
          </div>
          <div class="chat-panel" data-testid="report-agent-chat">
            <div class="chat-messages">
              <div v-for="(msg, idx) in chatMessages" :key="idx" class="chat-message" :class="msg.role">
                <div class="message-content">{{ msg.content }}</div>
                <div v-if="msg.sources && msg.sources.length" class="message-sources">
                  <div class="message-meta-title">回答来源</div>
                  <span v-for="(source, sourceIndex) in msg.sources" :key="`${idx}-source-${sourceIndex}`">{{ source }}</span>
                </div>
                <div v-else-if="msg.sourceChecked" class="message-sources muted">
                  本次回答未返回可引用来源。
                </div>
                <div v-if="msg.toolCalls && msg.toolCalls.length" class="tool-call-list">
                  <div class="message-meta-title">调用工具</div>
                  <span v-for="(tool, toolIndex) in msg.toolCalls" :key="`${idx}-tool-${toolIndex}`">
                    {{ tool.name || tool.tool_name || '工具调用' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="chat-input">
              <el-input
                v-model="chatInput"
                placeholder="向 ReportAgent 提问..."
                :disabled="chatLoading || !report?.simulation_id"
                @keyup.enter="sendMessage"
              >
                <template #append>
                  <el-button :icon="Promotion" :loading="chatLoading" @click="sendMessage" />
                </template>
              </el-input>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Download, Promotion, RefreshRight } from '@element-plus/icons-vue'
import RiskGaugeChart from '../components/charts/RiskGaugeChart.vue'
import AnalysisPanel from '../components/opinion/AnalysisPanel.vue'
import { chatWithReport, downloadReport, getReport } from '../api/report'

const route = useRoute()
const router = useRouter()

const STORAGE_KEYS = {
  reportId: 'risklens_current_report_id'
}

const loading = ref(false)
const downloading = ref(false)
const chatLoading = ref(false)
const loadError = ref('')
const report = ref(null)
const chatInput = ref('')
const chatMessages = ref([
  {
    role: 'assistant',
    content: '报告加载后，我可以基于本次仿真结果继续分析传播路径、关键节点、风险等级和处置建议。'
  }
])

function handleAnalysisEvidence(evidence) {
  if (!evidence) return
  const projectId = localStorage.getItem('risklens_current_project_id')
  if (['graph_node', 'graph_edge'].includes(evidence.source_type) && projectId) {
    router.push({
      path: `/analysis/${projectId}`,
      query: {
        evidenceType: evidence.source_type,
        evidenceId: evidence.source_id
      }
    })
  }
}

const routeReportId = computed(() => {
  const raw = Array.isArray(route.params.reportId) ? route.params.reportId[0] : route.params.reportId
  return raw && raw !== ':reportId' ? raw : ''
})

const activeReportId = computed(() => routeReportId.value || localStorage.getItem(STORAGE_KEYS.reportId) || '')

const reportTitle = computed(() => {
  return report.value?.outline?.title || '舆情风险分析报告'
})

const reportSubtitle = computed(() => {
  return report.value?.simulation_requirement || report.value?.report_id || '等待生成报告'
})

const reportMarkdown = computed(() => {
  if (report.value?.markdown_content) return report.value.markdown_content
  return outlineToMarkdown(report.value?.outline)
})

const reportBlocks = computed(() => parseMarkdown(reportMarkdown.value))

const statusHint = computed(() => {
  if (!report.value) return ''
  if (report.value.status === 'failed') {
    return report.value.error || '报告生成失败'
  }
  return '报告仍在生成中，刷新后可查看最新内容。'
})

const sectionSummaries = computed(() => {
  const sections = report.value?.outline?.sections || []
  return sections.map(section => ({
    title: section.title || '未命名章节',
    preview: stripMarkdown(section.content || '').slice(0, 80) || '等待生成章节内容'
  }))
})

const evidenceItems = computed(() => {
  const items = []
  reportBlocks.value.forEach((block, index) => {
    if (block.type === 'quote') {
      items.push({
        id: `quote-${index}`,
        type: '模拟引用',
        confidence: '高可信',
        source: '来自报告引用的 Agent 原始言行或模拟观察',
        excerpt: truncate(block.text, 110)
      })
      return
    }

    if (block.type === 'paragraph' && looksLikeEvidence(block.text)) {
      items.push({
        id: `paragraph-${index}`,
        type: '推演依据',
        confidence: inferConfidence(block.text),
        source: inferEvidenceSource(block.text),
        excerpt: truncate(block.text, 120)
      })
    }

    if (block.type === 'list') {
      block.items.forEach((text, itemIndex) => {
        if (looksLikeEvidence(text)) {
          items.push({
            id: `list-${index}-${itemIndex}`,
            type: '关键判断',
            confidence: inferConfidence(text),
            source: inferEvidenceSource(text),
            excerpt: truncate(text, 110)
          })
        }
      })
    }
  })
  return items.slice(0, 6)
})

const uncertaintyItems = computed(() => {
  return reportBlocks.value
    .filter(block => ['paragraph', 'quote'].includes(block.type))
    .map((block, index) => ({ id: `uncertainty-${index}`, text: block.text }))
    .filter(item => /不确定|不足|可能|相反|但|然而|限制|需要继续/i.test(item.text))
    .map(item => ({ ...item, text: truncate(item.text, 95) }))
    .slice(0, 3)
})

const riskGaugeValue = computed(() => {
  const text = `${reportMarkdown.value}\n${report.value?.simulation_requirement || ''}`
  if (!text.trim()) return 0

  const highRiskWords = ['高风险', '严重', '爆发', '扩散', '监管', '投诉', '兑付', '延期', '违约', '负面', '声誉风险']
  const mediumRiskWords = ['风险', '关注', '不确定', '传播', '舆情', '影响', '波动']
  const highCount = highRiskWords.reduce((sum, word) => sum + countOccurrences(text, word), 0)
  const mediumCount = mediumRiskWords.reduce((sum, word) => sum + countOccurrences(text, word), 0)

  return clamp(35 + highCount * 5 + mediumCount * 2, 20, 95)
})

async function loadReport() {
  const id = activeReportId.value
  if (!id) {
    loadError.value = '暂无可查看的报告 ID。请先在仿真监控页生成报告。'
    return
  }

  loading.value = true
  loadError.value = ''

  try {
    const res = await getReport(id)
    report.value = res.data
    if (report.value?.report_id) {
      localStorage.setItem(STORAGE_KEYS.reportId, report.value.report_id)
      if (!routeReportId.value) {
        router.replace(`/report/${report.value.report_id}`)
      }
    }
  } catch (err) {
    report.value = null
    loadError.value = err.message || '报告加载失败'
  } finally {
    loading.value = false
  }
}

async function downloadCurrentReport() {
  const id = activeReportId.value
  if (!id) return

  downloading.value = true
  try {
    const payload = await downloadReport(id)
    const blob = payload instanceof Blob
      ? payload
      : new Blob([payload], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${safeFilename(reportTitle.value || id)}.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    ElMessage.error(err.message || '报告下载失败')
  } finally {
    downloading.value = false
  }
}

async function sendMessage() {
  const message = chatInput.value.trim()
  if (!message || chatLoading.value) return
  if (!report.value?.simulation_id) {
    ElMessage.warning('报告缺少仿真 ID，暂时无法追问。')
    return
  }

  const history = chatMessages.value
    .filter(item => ['user', 'assistant'].includes(item.role))
    .map(item => ({ role: item.role, content: item.content }))
    .slice(-10)

  chatMessages.value.push({ role: 'user', content: message })
  chatInput.value = ''
  chatLoading.value = true

  try {
    const res = await chatWithReport({
      simulation_id: report.value.simulation_id,
      message,
      chat_history: history
    })
    const payload = res.data || {}
    chatMessages.value.push({
      role: 'assistant',
      content: payload.response || 'ReportAgent 暂未返回有效内容。',
      sources: normalizeSources(payload.sources),
      toolCalls: normalizeToolCalls(payload.tool_calls),
      sourceChecked: true
    })
  } catch (err) {
    chatMessages.value.push({
      role: 'assistant',
      content: `追问失败：${err.message || '后端服务暂不可用'}`,
      sources: [],
      toolCalls: [],
      sourceChecked: true
    })
  } finally {
    chatLoading.value = false
  }
}

function looksLikeEvidence(text = '') {
  return /因为|显示|表明|来自|依据|证据|引用|轮次|Agent|主体|节点|图谱|搜索|工具|模拟|观察/.test(text)
}

function inferConfidence(text = '') {
  if (/引用|原始|工具|搜索|图谱|轮次|节点/.test(text)) return '高可信'
  if (/可能|推测|不确定|不足/.test(text)) return '需复核'
  return '中可信'
}

function inferEvidenceSource(text = '') {
  if (/图谱|节点|主体|关系/.test(text)) return '关联图谱 / 主体关系'
  if (/轮次|模拟|Agent|引用|发言/.test(text)) return '模拟轮次 / Agent 行为'
  if (/工具|搜索|检索/.test(text)) return 'Report Agent 工具检索'
  return '报告正文推断'
}

function normalizeSources(sources = []) {
  if (!Array.isArray(sources)) return []
  return sources
    .map(source => typeof source === 'string' ? source : source?.title || source?.query || source?.source || JSON.stringify(source))
    .filter(Boolean)
    .slice(0, 4)
}

function normalizeToolCalls(toolCalls = []) {
  if (!Array.isArray(toolCalls)) return []
  return toolCalls
    .map(tool => typeof tool === 'string' ? { name: tool } : tool)
    .filter(Boolean)
    .slice(0, 4)
}

function outlineToMarkdown(outline) {
  if (!outline) return ''

  const parts = []
  if (outline.title) parts.push(`# ${outline.title}`)
  if (outline.summary) parts.push(`> ${outline.summary}`)
  ;(outline.sections || []).forEach(section => {
    if (section.title) parts.push(`## ${section.title}`)
    if (section.content) parts.push(section.content)
  })

  return parts.join('\n\n')
}

function parseMarkdown(markdown = '') {
  const blocks = []
  const lines = markdown.split(/\r?\n/)
  let paragraph = []
  let listItems = []
  let listOrdered = false
  let quote = []
  let code = []
  let inCode = false

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', ordered: listOrdered, items: listItems })
      listItems = []
      listOrdered = false
    }
  }

  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ type: 'quote', text: quote.join(' ') })
      quote = []
    }
  }

  lines.forEach(line => {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flushParagraph()
      flushList()
      flushQuote()
      if (inCode) {
        blocks.push({ type: 'code', text: code.join('\n') })
        code = []
      }
      inCode = !inCode
      return
    }

    if (inCode) {
      code.push(line)
      return
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      flushQuote()
      return
    }

    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (heading) {
      flushParagraph()
      flushList()
      flushQuote()
      const level = Math.min(4, heading[1].length)
      blocks.push({ type: 'heading', tag: `h${Math.max(3, level + 2)}`, text: heading[2] })
      return
    }

    const ordered = trimmed.match(/^\d+\.\s+(.+)$/)
    const unordered = trimmed.match(/^[-*]\s+(.+)$/)
    if (ordered || unordered) {
      flushParagraph()
      flushQuote()
      const isOrdered = Boolean(ordered)
      if (listItems.length && listOrdered !== isOrdered) flushList()
      listOrdered = isOrdered
      listItems.push((ordered || unordered)[1])
      return
    }

    if (trimmed.startsWith('>')) {
      flushParagraph()
      flushList()
      quote.push(trimmed.replace(/^>\s?/, ''))
      return
    }

    flushList()
    flushQuote()
    paragraph.push(trimmed)
  })

  flushParagraph()
  flushList()
  flushQuote()
  if (code.length) blocks.push({ type: 'code', text: code.join('\n') })

  return blocks
}

function stripMarkdown(text = '') {
  return text
    .replace(/[#>*_`-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function countOccurrences(text, word) {
  return text.split(word).length - 1
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function truncate(text = '', max = 100) {
  const normalized = stripMarkdown(String(text))
  return normalized.length > max ? `${normalized.slice(0, max)}...` : normalized
}

function safeFilename(name) {
  return String(name).replace(/[\\/:*?"<>|]+/g, '_').slice(0, 80)
}

onMounted(loadReport)

watch(() => route.params.reportId, loadReport)
</script>

<style scoped>
.report-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  background-color: var(--rl-surface);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
  padding: 20px;
}

.report-card {
  min-height: calc(100vh - 160px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.card-header.compact {
  margin-bottom: 14px;
}

.header-copy {
  min-width: 0;
}

.card-title {
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--rl-text-primary);
  margin: 0 0 6px 0;
  overflow-wrap: anywhere;
}

.card-subtitle {
  font-size: 0.85rem;
  color: var(--rl-text-muted);
  margin: 0;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.status-alert {
  margin-bottom: 18px;
}

.report-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.report-heading {
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  color: var(--rl-text-primary);
  margin: 16px 0 2px;
  line-height: 1.4;
}

h3.report-heading {
  font-size: 1.2rem;
}

h4.report-heading,
h5.report-heading,
h6.report-heading {
  font-size: 1rem;
}

.report-paragraph,
.report-list,
.report-quote {
  color: var(--rl-text-secondary);
  font-size: 0.92rem;
  line-height: 1.85;
  margin: 0;
}

.report-list {
  padding-left: 22px;
}

.report-list li + li {
  margin-top: 6px;
}

.report-quote {
  padding: 10px 14px;
  border-left: 3px solid var(--rl-gold);
  background-color: var(--rl-surface-elevated);
  border-radius: 6px;
}

.report-code {
  padding: 12px;
  overflow-x: auto;
  color: var(--rl-text-primary);
  background-color: var(--rl-surface-elevated);
  border: 1px solid var(--rl-border);
  border-radius: 6px;
  font-size: 0.82rem;
  line-height: 1.6;
}

.empty-state,
.small-empty {
  color: var(--rl-text-muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.empty-state {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.side-panel {
  min-width: 0;
}

.gauge-wrapper {
  height: 240px;
}

.risk-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--rl-text-muted);
  font-size: 0.78rem;
  overflow-wrap: anywhere;
}

.mt-4 {
  margin-top: 16px;
}

.section-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-item {
  display: flex;
  gap: 10px;
  padding: 12px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.section-index {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, var(--rl-gold), var(--rl-brand-light));
  font-size: 0.72rem;
  font-weight: 700;
}

.section-title {
  color: var(--rl-text-primary);
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.4;
}

.section-item p {
  margin: 4px 0 0;
  color: var(--rl-text-muted);
  font-size: 0.78rem;
  line-height: 1.5;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.evidence-item {
  padding: 12px;
  background-color: var(--rl-surface-elevated);
  border: 1px solid var(--rl-border);
  border-radius: 8px;
}

.evidence-topline {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.evidence-topline span {
  color: var(--rl-gold);
  font-size: 0.76rem;
  font-weight: 600;
}

.evidence-topline strong {
  color: var(--rl-text-secondary);
  font-size: 0.72rem;
  font-weight: 500;
}

.evidence-item p,
.uncertainty-box p {
  margin: 0;
  color: var(--rl-text-primary);
  font-size: 0.8rem;
  line-height: 1.65;
}

.evidence-meta {
  margin-top: 8px;
  color: var(--rl-text-muted);
  font-size: 0.72rem;
}

.uncertainty-box {
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.24);
  border-radius: 8px;
}

.uncertainty-title {
  color: var(--rl-gold);
  font-size: 0.78rem;
  font-weight: 600;
  margin-bottom: 8px;
}

.uncertainty-box p + p {
  margin-top: 8px;
}

.chat-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-messages {
  max-height: 320px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-message {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.chat-message.user {
  align-self: flex-end;
  background: linear-gradient(135deg, var(--rl-brand-light), var(--rl-gold));
  color: white;
  max-width: 82%;
}

.chat-message.assistant {
  align-self: flex-start;
  background-color: var(--rl-surface-elevated);
  color: var(--rl-text-primary);
  border: 1px solid var(--rl-border);
  max-width: 92%;
}

.message-sources,
.tool-call-list {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--rl-border);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.message-sources span,
.tool-call-list span {
  max-width: 100%;
  padding: 3px 8px;
  border-radius: 999px;
  background-color: var(--rl-surface);
  color: var(--rl-text-secondary);
  font-size: 0.72rem;
  overflow-wrap: anywhere;
}

.message-sources.muted {
  color: var(--rl-text-muted);
  font-size: 0.75rem;
}

.message-meta-title {
  width: 100%;
  color: var(--rl-text-muted);
  font-size: 0.72rem;
}

@media (max-width: 992px) {
  .el-col + .el-col {
    margin-top: 20px;
  }
}

@media (max-width: 720px) {
  .card-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
