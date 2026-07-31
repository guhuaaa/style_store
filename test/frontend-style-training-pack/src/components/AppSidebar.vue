<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-icon">
          <img src="/brand/risknick-mark.png" alt="" aria-hidden="true">
        </div>
        <span v-show="!appStore.sidebarCollapsed" class="brand-text">risknick</span>
      </div>
      <button class="collapse-btn" @click="appStore.toggleSidebar">
        <el-icon size="16"><Fold v-if="!appStore.sidebarCollapsed" /><Expand v-else /></el-icon>
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="route in navRoutes"
        :key="route.name"
        :to="resolveRoutePath(route)"
        :data-testid="`nav-${String(route.name).toLowerCase()}`"
        class="nav-item"
        :class="{ active: $route.name === route.name }"
      >
        <el-icon size="18">
          <component :is="route.meta.icon" />
        </el-icon>
        <span v-show="!appStore.sidebarCollapsed" class="nav-title">{{ route.meta.title }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer" v-show="!appStore.sidebarCollapsed">
      <div class="system-status">
        <span class="status-dot" :class="statusClass"></span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../stores/app'
import { routes } from '../router/index.js'

const appStore = useAppStore()
const currentRoute = useRoute()

const navRoutes = routes.filter(r => r.meta?.title)

const STORAGE_KEYS = {
  projectId: 'risklens_current_project_id',
  simulationId: 'risklens_current_simulation_id',
  reportId: 'risklens_current_report_id'
}

function resolveRoutePath(route) {
  if (route.name === 'Analysis') {
    const projectId = localStorage.getItem(STORAGE_KEYS.projectId)
    return `/analysis/${projectId || 'new'}`
  }

  if (route.name === 'Simulation') {
    const simulationId = localStorage.getItem(STORAGE_KEYS.simulationId)
    return simulationId ? `/simulation/${simulationId}` : '/analysis/new'
  }

  if (route.name === 'Report') {
    const reportId = localStorage.getItem(STORAGE_KEYS.reportId)
    return reportId ? `/report/${reportId}` : '/analysis/new'
  }

  if (route.path.includes(':')) {
    return currentRoute.fullPath || '/'
  }

  return route.path
}

const statusClass = computed(() => {
  // 这里可以根据后端状态动态调整
  return 'online'
})

const statusText = computed(() => '系统在线')
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--ui-sap) 88%, var(--ui-ink)), color-mix(in srgb, var(--ui-sap) 70%, var(--ui-ink))),
    var(--craft-fiber);
  border-right: 2px solid color-mix(in srgb, var(--ui-gold) 72%, var(--ui-ink));
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.3s ease;
  box-shadow: 10px 0 34px rgba(73, 57, 31, 0.14);
  color: #fff9ea;
}

.sidebar::before,
.sidebar::after {
  content: "";
  position: absolute;
  left: 9px;
  right: 9px;
  height: 62px;
  pointer-events: none;
  border: 1px solid rgba(255, 249, 234, 0.2);
  background:
    radial-gradient(ellipse at 50% 18%, transparent 0 20%, rgba(255, 249, 234, 0.22) 21% 22%, transparent 23%),
    linear-gradient(90deg, transparent 0 44%, rgba(255, 249, 234, 0.22) 45% 55%, transparent 56% 100%);
  opacity: 0.75;
}

.sidebar::before {
  top: 74px;
}

.sidebar::after {
  bottom: 12px;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar.collapsed .sidebar-header {
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 4px 0;
}

.sidebar.collapsed .brand {
  gap: 0;
}

.sidebar.collapsed .brand-icon {
  width: 28px;
  height: 28px;
}

.sidebar.collapsed .collapse-btn {
  width: 22px;
  height: 22px;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 249, 234, 0.2);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.brand-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background: var(--ui-paper);
  box-shadow:
    0 0 0 1px rgba(255, 249, 234, 0.42),
    0 0 0 4px rgba(173, 127, 43, 0.22);
}

.brand-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.brand-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff9ea;
  letter-spacing: 0;
  white-space: nowrap;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(255, 249, 234, 0.28);
  border-radius: var(--craft-radius);
  background: rgba(255, 249, 234, 0.08);
  color: #efe4c4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover {
  border-color: rgba(255, 249, 234, 0.62);
  color: #fff9ea;
  background: rgba(255, 249, 234, 0.14);
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--craft-radius);
  color: rgba(255, 249, 234, 0.76);
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.nav-item:hover {
  background-color: rgba(255, 249, 234, 0.08);
  color: #fff9ea;
  border-color: rgba(255, 249, 234, 0.16);
}

.nav-item.active {
  background:
    linear-gradient(90deg, rgba(255, 249, 234, 0.18), rgba(255, 249, 234, 0.05)),
    radial-gradient(circle at 94% 50%, rgba(173, 127, 43, 0.28), transparent 32%);
  color: #fff9ea;
  border-color: rgba(255, 249, 234, 0.26);
  box-shadow: inset 3px 0 0 var(--ui-gold);
}

.nav-title {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 249, 234, 0.2);
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(255, 249, 234, 0.72);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #b4c89a;
  box-shadow: 0 0 0 3px rgba(180, 200, 154, 0.18);
}
</style>
