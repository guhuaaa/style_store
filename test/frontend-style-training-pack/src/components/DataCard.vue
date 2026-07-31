<template>
  <div class="data-card" :class="{ 'clickable': clickable, 'trend-up': trend === 'up', 'trend-down': trend === 'down' }">
    <div class="card-header">
      <span class="card-title">{{ title }}</span>
      <el-icon v-if="icon" :size="18" class="card-icon" :style="{ color: iconColor }">
        <component :is="icon" />
      </el-icon>
    </div>
    <div class="card-value" :style="{ color: valueColor }">
      <slot name="value">{{ value }}</slot>
    </div>
    <div class="card-footer">
      <span v-if="trend" class="trend-tag" :class="trend">
        <el-icon size="12"><ArrowUp v-if="trend === 'up'" /><ArrowDown v-else /></el-icon>
        {{ trendValue }}
      </span>
      <span v-if="subtitle" class="card-subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  value: [String, Number],
  subtitle: String,
  icon: String,
  iconColor: { type: String, default: 'var(--ui-gold)' },
  valueColor: { type: String, default: 'var(--rl-text-primary)' },
  trend: { type: String, validator: v => ['up', 'down'].includes(v) },
  trendValue: String,
  clickable: Boolean
})
</script>

<style scoped>
.data-card {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 94%, transparent), color-mix(in srgb, var(--ui-paper) 18%, var(--rl-surface))),
    var(--craft-fiber);
  border: 1px solid var(--rl-border);
  border-radius: var(--craft-radius);
  padding: 20px;
  box-shadow: var(--craft-shadow-soft);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.data-card::before {
  content: "";
  position: absolute;
  inset: 7px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--rl-border) 62%, transparent);
  border-radius: 3px;
}

.data-card::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 42px;
  height: 42px;
  background:
    linear-gradient(135deg, transparent 0 48%, color-mix(in srgb, var(--ui-gold) 36%, transparent) 49% 52%, transparent 53%),
    radial-gradient(circle at 82% 16%, color-mix(in srgb, var(--ui-sap) 24%, transparent), transparent 34%);
  opacity: 0.8;
}

.data-card.clickable {
  cursor: pointer;
}

.data-card:hover {
  border-color: var(--rl-brand-light);
  box-shadow: var(--craft-shadow);
  transform: translateY(-1px);
}

.card-header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 0.85rem;
  color: var(--rl-text-secondary);
}

.card-icon {
  opacity: 0.8;
}

.card-value {
  position: relative;
  z-index: 1;
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: 0;
}

.card-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.trend-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.trend-tag.up {
  background-color: color-mix(in srgb, var(--ui-risk-low) 14%, transparent);
  color: var(--ui-risk-low);
  border: 1px solid color-mix(in srgb, var(--ui-risk-low) 28%, transparent);
}

.trend-tag.down {
  background-color: color-mix(in srgb, var(--ui-risk-critical) 14%, transparent);
  color: var(--ui-risk-critical);
  border: 1px solid color-mix(in srgb, var(--ui-risk-critical) 28%, transparent);
}

.card-subtitle {
  font-size: 0.8rem;
  color: var(--rl-text-muted);
}
</style>
