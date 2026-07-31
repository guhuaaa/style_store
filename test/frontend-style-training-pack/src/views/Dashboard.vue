<template>
  <div class="dashboard-page">
    <!-- 顶部数据概览 -->
    <section class="metrics-section">
      <DataCard
        title="今日舆情总量"
        value="2,847"
        subtitle="较昨日 +12.3%"
        icon="ChatDotRound"
        icon-color="var(--ui-charcoal)"
        trend="up"
        trend-value="12.3%"
      />
      <DataCard
        title="风险指数"
        value="68.5"
        subtitle="中高风险"
        icon="Warning"
        icon-color="var(--ui-risk-critical)"
        value-color="var(--ui-risk-critical)"
      />
      <DataCard
        title="负面舆情占比"
        value="23.8%"
        subtitle="较昨日 -2.1%"
        icon="TrendCharts"
        icon-color="var(--ui-risk-medium)"
        trend="down"
        trend-value="2.1%"
      />
      <DataCard
        title="监测主体"
        value="156"
        subtitle="企业 / 产品 / 人物"
        icon="User"
        icon-color="var(--ui-risk-low)"
      />
    </section>

    <!-- 主内容区 -->
    <section class="main-grid">
      <!-- 左侧：情感趋势 -->
      <div class="chart-card large">
        <div class="card-header">
          <h3 class="card-title">舆情情感趋势</h3>
          <el-radio-group v-model="trendRange" size="small">
            <el-radio-button label="24h">24小时</el-radio-button>
            <el-radio-button label="7d">7天</el-radio-button>
            <el-radio-button label="30d">30天</el-radio-button>
          </el-radio-group>
        </div>
        <div class="chart-body">
          <SentimentTrendChart :data="trendData" />
        </div>
      </div>

      <!-- 右侧：风险指数 -->
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">综合风险指数</h3>
        </div>
        <div class="chart-body gauge-body">
          <RiskGaugeChart :value="68.5" title="综合风险" />
        </div>
      </div>
    </section>

    <!-- 中部：热点事件与快速入口 -->
    <section class="middle-grid">
      <!-- 热点事件 -->
      <div class="content-card">
        <div class="card-header">
          <h3 class="card-title">实时热点事件</h3>
          <el-button link type="primary" size="small">查看全部</el-button>
        </div>
        <div class="event-list">
          <div v-for="(event, idx) in hotEvents" :key="idx" class="event-item" :class="event.level">
            <div class="event-main">
              <span class="event-level-dot"></span>
              <div class="event-info">
                <div class="event-title">{{ event.title }}</div>
                <div class="event-meta">
                  <span>{{ event.source }}</span>
                  <span>{{ event.time }}</span>
                  <span :class="['sentiment-tag', event.sentiment]">{{ event.sentimentText }}</span>
                </div>
              </div>
            </div>
            <div class="event-heat">
              <el-icon><TrendCharts /></el-icon>
              <span>{{ event.heat }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 快速创建任务 -->
      <div class="content-card quick-start">
        <div class="card-header">
          <h3 class="card-title">新建风险推演任务</h3>
        </div>
        <div class="quick-form">
          <div class="upload-area" @click="triggerUpload">
            <el-icon size="32" color="var(--ui-gold)"><Upload /></el-icon>
            <div class="upload-text">
              <div class="upload-title">上传舆情素材</div>
              <div class="upload-hint">支持 PDF / Word / TXT / Markdown</div>
            </div>
          </div>
          <el-input
            v-model="quickTask.requirement"
            type="textarea"
            :rows="3"
            placeholder="描述分析目标，例如：分析某银行理财产品负面舆情在社交媒体上的传播路径与潜在影响..."
          />
          <el-button type="primary" size="large" class="start-btn" @click="startQuickTask" :disabled="!canStart">
            <el-icon class="mr-2"><TrendCharts /></el-icon>
            开始风险推演
          </el-button>
        </div>
      </div>
    </section>

    <!-- 底部：历史项目 -->
    <section class="content-card">
      <div class="card-header">
        <h3 class="card-title">近期分析任务</h3>
        <el-button link type="primary" size="small" @click="$router.push('/analysis/new')">新建任务</el-button>
      </div>
      <el-table :data="recentProjects" style="width: 100%">
        <el-table-column prop="name" label="任务名称" min-width="200">
          <template #default="{ row }">
            <div class="project-name">
              <el-icon size="16"><Document /></el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="分析类型" width="120" />
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <StatusBadge :type="row.statusType" :text="row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="riskScore" label="风险指数" width="120">
          <template #default="{ row }">
            <span :style="{ color: getRiskColor(row.riskScore), fontWeight: 600 }">{{ row.riskScore }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="goToAnalysis(row.id)">查看</el-button>
            <el-button link type="primary" size="small" @click="goToReport(row.reportId)">报告</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DataCard from '../components/DataCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import SentimentTrendChart from '../components/charts/SentimentTrendChart.vue'
import RiskGaugeChart from '../components/charts/RiskGaugeChart.vue'
import { setPendingUpload } from '../store/pendingUpload'

const router = useRouter()

const trendRange = ref('24h')
const quickTask = ref({ requirement: '', files: [] })

const canStart = computed(() => quickTask.value.requirement.trim().length > 10)

const trendData = ref({
  times: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
  positive: [12, 18, 35, 42, 38, 45],
  negative: [8, 12, 25, 38, 52, 48],
  neutral: [30, 28, 32, 35, 30, 28]
})

const hotEvents = ref([
  { title: '某城商行理财产品净值回撤引发投资者关注', source: '微博', time: '10分钟前', heat: '8,234', level: 'high', sentiment: 'negative', sentimentText: '负面' },
  { title: '监管部门发布互联网金融新规征求意见稿', source: '财新网', time: '32分钟前', heat: '5,612', level: 'medium', sentiment: 'neutral', sentimentText: '中性' },
  { title: '头部券商发布下半年投资策略报告', source: '东方财富', time: '1小时前', heat: '3,891', level: 'low', sentiment: 'positive', sentimentText: '正面' },
  { title: '某保险公司理赔纠纷登上热搜', source: '抖音', time: '2小时前', heat: '12,405', level: 'high', sentiment: 'negative', sentimentText: '负面' },
  { title: '央行宣布降准0.25个百分点', source: '新华社', time: '3小时前', heat: '25,678', level: 'low', sentiment: 'positive', sentimentText: '正面' }
])

const recentProjects = ref([
  { id: 'p1', name: '某银行理财产品舆情风险推演', type: '产品舆情', createdAt: '2026-07-02 14:30', status: '已完成', statusType: 'success', riskScore: 72.5, reportId: 'r1' },
  { id: 'p2', name: '互联网金融新规影响评估', type: '政策解读', createdAt: '2026-07-01 09:15', status: '处理中', statusType: 'processing', riskScore: 58.0, reportId: null },
  { id: 'p3', name: '某券商研报争议事件分析', type: '机构舆情', createdAt: '2026-06-30 16:45', status: '已完成', statusType: 'success', riskScore: 45.2, reportId: 'r2' },
  { id: 'p4', name: '保险理赔纠纷传播路径分析', type: '事件推演', createdAt: '2026-06-28 11:20', status: '警告', statusType: 'warning', riskScore: 81.3, reportId: 'r3' }
])

const triggerUpload = () => {
  // 简化实现：跳转到完整分析页面
  router.push('/analysis/new')
}

const startQuickTask = () => {
  setPendingUpload([], quickTask.value.requirement)
  router.push({ name: 'Analysis', params: { projectId: 'new' } })
}

const goToAnalysis = (id) => {
  router.push(`/analysis/${id}`)
}

const goToReport = (reportId) => {
  if (reportId) router.push(`/report/${reportId}`)
}

function getRiskColor(score) {
  if (score < 40) return 'var(--ui-risk-low)'
  if (score < 70) return 'var(--ui-risk-medium)'
  return 'var(--ui-risk-critical)'
}
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  min-height: 360px;
}

.middle-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 20px;
}

.chart-card,
.content-card {
  background-color: var(--rl-surface);
  border: 1px solid var(--rl-border);
  border-radius: 12px;
  padding: 20px;
}

.chart-card.large {
  min-height: 360px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--rl-text-primary);
  margin: 0;
}

.chart-body {
  height: 280px;
}

.gauge-body {
  height: 260px;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.event-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  border-radius: 8px;
  background-color: var(--rl-surface-elevated);
  border-left: 3px solid var(--rl-border);
  transition: all 0.2s;
}

.event-item:hover {
  background-color: var(--rl-border);
}

.event-item.high { border-left-color: var(--rl-risk); }
.event-item.medium { border-left-color: var(--rl-gold); }
.event-item.low { border-left-color: var(--rl-safe); }

.event-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.event-level-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.event-item.high .event-level-dot { background-color: var(--rl-risk); }
.event-item.medium .event-level-dot { background-color: var(--rl-gold); }
.event-item.low .event-level-dot { background-color: var(--rl-safe); }

.event-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-title {
  font-weight: 500;
  color: var(--rl-text-primary);
  font-size: 0.95rem;
}

.event-meta {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  color: var(--rl-text-muted);
}

.sentiment-tag {
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
}

.sentiment-tag.positive { background-color: color-mix(in srgb, var(--ui-risk-low) 12%, transparent); color: var(--ui-risk-low); }
.sentiment-tag.negative { background-color: color-mix(in srgb, var(--ui-risk-critical) 12%, transparent); color: var(--ui-risk-critical); }
.sentiment-tag.neutral { background-color: color-mix(in srgb, var(--ui-muted) 12%, transparent); color: var(--ui-graphite); }

.event-heat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--rl-gold);
  font-size: 0.85rem;
  font-weight: 600;
}

.quick-start {
  display: flex;
  flex-direction: column;
}

.quick-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px dashed var(--rl-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: var(--rl-gold);
  background-color: rgba(212, 175, 55, 0.05);
}

.upload-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  font-weight: 500;
  color: var(--rl-text-primary);
}

.upload-hint {
  font-size: 0.8rem;
  color: var(--rl-text-muted);
}

.start-btn {
  width: 100%;
  background: linear-gradient(90deg, var(--rl-brand-light), var(--rl-gold));
  border: none;
  font-weight: 600;
}

.start-btn:hover {
  opacity: 0.9;
}

.project-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--rl-text-primary);
}

@media (max-width: 1280px) {
  .metrics-section { grid-template-columns: repeat(2, 1fr); }
  .main-grid { grid-template-columns: 1fr; }
  .middle-grid { grid-template-columns: 1fr; }
}

.chart-card,
.content-card {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 94%, transparent), color-mix(in srgb, var(--ui-paper) 22%, var(--rl-surface))),
    var(--craft-fiber);
  border-radius: var(--craft-radius);
  box-shadow: var(--craft-shadow-soft);
}

.chart-card::before,
.content-card::before {
  content: "";
  position: absolute;
  inset: 7px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--rl-border) 58%, transparent);
  border-radius: 3px;
}

.card-header,
.chart-body,
.event-list,
.quick-form {
  position: relative;
  z-index: 1;
}

.card-title {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  letter-spacing: 0;
}

.event-item,
.upload-area {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface-elevated) 80%, transparent), color-mix(in srgb, var(--rl-surface) 42%, transparent));
  border-radius: var(--craft-radius);
}

.upload-area:hover {
  border-color: var(--ui-sap);
  background-color: color-mix(in srgb, var(--ui-sage) 12%, var(--rl-surface));
}

.start-btn {
  background: linear-gradient(90deg, var(--ui-sap), var(--ui-gold));
}
</style>
