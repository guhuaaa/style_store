<template>
  <div class="settings-page" data-testid="settings-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">模型 API 配置</h3>
          </div>
          <el-form :model="settings" label-position="top">
            <el-form-item label="LLM API Key">
              <el-input v-model="settings.llmApiKey" type="password" show-password placeholder="请输入大模型 API Key" />
            </el-form-item>
            <el-form-item label="Base URL">
              <el-input v-model="settings.llmBaseUrl" placeholder="https://dashscope.aliyuncs.com/compatible-mode/v1" />
            </el-form-item>
            <el-form-item label="模型名称">
              <el-input v-model="settings.llmModel" placeholder="qwen-plus" />
            </el-form-item>
            <el-form-item label="Zep API Key">
              <el-input v-model="settings.zepApiKey" type="password" show-password placeholder="用于记忆图谱的 Zep API Key" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveSettings">保存配置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="content-card">
          <div class="card-header">
            <h3 class="card-title">界面设置</h3>
          </div>
          <div class="setting-item">
            <div>
              <div class="setting-title">主题模式</div>
              <div class="setting-desc">切换亮色 / 暗色主题</div>
            </div>
            <el-switch
              v-model="appStore.isDark"
              active-text="暗色"
              inactive-text="亮色"
              @change="appStore.toggleTheme"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useAppStore } from '../stores/app'

const appStore = useAppStore()

const settings = ref({
  llmApiKey: '',
  llmBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  llmModel: 'qwen-plus',
  zepApiKey: ''
})

const saveSettings = () => {
  // 实际应保存到后端或 localStorage
  ElMessage.success('配置已保存')
}
</script>

<style scoped>
.settings-page {
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
  margin-bottom: 20px;
}

.card-title {
  font-family: 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--rl-text-primary);
  margin: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--rl-surface-elevated);
  border-radius: 8px;
}

.setting-title {
  font-weight: 500;
  color: var(--rl-text-primary);
  margin-bottom: 4px;
}

.setting-desc {
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
.setting-item,
:deep(.el-form) {
  position: relative;
  z-index: 1;
}

.card-title {
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  letter-spacing: 0;
}

.setting-item {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface-elevated) 80%, transparent), color-mix(in srgb, var(--rl-surface) 42%, transparent));
  border: 1px solid color-mix(in srgb, var(--rl-border) 70%, transparent);
  border-radius: var(--craft-radius);
}
</style>
