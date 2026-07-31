<template>
  <div class="monitor-page">
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">舆情监测源配置</h3>
            <el-button type="primary" size="small">添加数据源</el-button>
          </div>
          <el-table :data="dataSources" style="width: 100%">
            <el-table-column prop="name" label="数据源" min-width="180" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <StatusBadge :type="row.status === '运行中' ? 'online' : 'offline'" :text="row.status" />
              </template>
            </el-table-column>
            <el-table-column prop="updateTime" label="最近更新" width="160" />
            <el-table-column label="操作" width="120">
              <template #default>
                <el-button link type="primary" size="small">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">监控规则</h3>
          </div>
          <div class="rule-list">
            <div v-for="(rule, idx) in rules" :key="idx" class="rule-item">
              <div class="rule-title">{{ rule.name }}</div>
              <div class="rule-desc">{{ rule.desc }}</div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StatusBadge from '../components/StatusBadge.vue'

const dataSources = ref([
  { name: '微博热搜', type: '社交媒体', status: '运行中', updateTime: '2026-07-03 10:23' },
  { name: '东方财富股吧', type: '投资社区', status: '运行中', updateTime: '2026-07-03 10:20' },
  { name: '财新网', type: '财经新闻', status: '运行中', updateTime: '2026-07-03 10:15' },
  { name: '证监会公告', type: '监管公告', status: '暂停', updateTime: '2026-07-03 09:00' }
])

const rules = ref([
  { name: '高风险主体监控', desc: '当监测到 banks、insurance 等行业负面舆情时触发预警' },
  { name: '情感阈值预警', desc: '负面情感占比超过 30% 时发送告警' },
  { name: '传播速度预警', desc: '1小时内转发量超过 1000 时升级为高优先级' }
])
</script>

<style scoped>
.monitor-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-card {
  background-color: var(--rl-surface);
  border: 1px solid var(--rl-border);
  border-radius: 12px;
  padding: 20px;
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

.rule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 14px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.rule-title {
  font-weight: 500;
  color: var(--rl-text-primary);
  margin-bottom: 4px;
}

.rule-desc {
  font-size: 0.8rem;
  color: var(--rl-text-muted);
}

.content-card {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 94%, transparent), color-mix(in srgb, var(--ui-paper) 22%, var(--rl-surface))),
    var(--craft-fiber);
  border-radius: var(--craft-radius);
  box-shadow: var(--craft-shadow-soft);
}

.content-card::before {
  content: "";
  position: absolute;
  inset: 7px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--rl-border) 58%, transparent);
  border-radius: 3px;
}

.card-header,
.rule-list {
  position: relative;
  z-index: 1;
}

.card-title {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  letter-spacing: 0;
}

.rule-item {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface-elevated) 80%, transparent), color-mix(in srgb, var(--rl-surface) 42%, transparent));
  border: 1px solid color-mix(in srgb, var(--rl-border) 70%, transparent);
  border-radius: var(--craft-radius);
}
</style>
