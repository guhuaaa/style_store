<template>
  <span class="status-badge" :class="type">
    <span class="dot"></span>
    <span class="text">{{ text || defaultText }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'default' },
  text: String
})

const defaultText = computed(() => {
  const map = {
    default: '默认',
    processing: '处理中',
    success: '已完成',
    warning: '警告',
    error: '错误',
    online: '在线',
    offline: '离线'
  }
  return map[props.type] || '默认'
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 650;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 68%, transparent), color-mix(in srgb, var(--rl-surface-elevated) 78%, transparent));
  color: var(--rl-text-secondary);
  border: 1px solid var(--rl-border);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--rl-surface) 86%, transparent);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-badge.processing .dot {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.status-badge.success { color: var(--ui-risk-low); border-color: color-mix(in srgb, var(--ui-risk-low) 38%, transparent); }
.status-badge.processing { color: var(--ui-gold); border-color: color-mix(in srgb, var(--ui-gold) 38%, transparent); }
.status-badge.warning { color: var(--ui-risk-medium); border-color: color-mix(in srgb, var(--ui-risk-medium) 38%, transparent); }
.status-badge.error { color: var(--ui-risk-critical); border-color: color-mix(in srgb, var(--ui-risk-critical) 38%, transparent); }
.status-badge.online { color: var(--ui-risk-low); border-color: color-mix(in srgb, var(--ui-risk-low) 38%, transparent); }
.status-badge.offline { color: var(--rl-text-muted); border-color: var(--rl-border); }
</style>
