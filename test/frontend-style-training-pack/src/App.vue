<template>
  <div v-if="authLoading" class="auth-splash" role="status" aria-live="polite">
    <div class="auth-spinner"></div>
    <span>正在检查访问权限...</span>
  </div>

  <LoginGate v-else-if="authRequired" @authenticated="handleAuthenticated" />

  <div v-else class="app-root" data-testid="app-root">
    <AppSidebar />
    <div class="app-main" :class="{ 'sidebar-collapsed': appStore.sidebarCollapsed }">
      <AppHeader />
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppHeader from './components/AppHeader.vue'
import LoginGate from './components/LoginGate.vue'
import AppSidebar from './components/AppSidebar.vue'
import { getAuthStatus } from './api/auth'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

const authLoading = ref(false)
const authRequired = ref(false)

async function refreshAuthStatus() {
  authLoading.value = true
  try {
    const status = await getAuthStatus()
    authRequired.value = Boolean(status.auth_enabled && !status.authenticated)
  } catch (err) {
    authRequired.value = true
  } finally {
    authLoading.value = false
  }
}

function handleAuthenticated() {
  authRequired.value = false
}

function handleAuthRequired() {
  authRequired.value = true
  authLoading.value = false
}

onMounted(() => {
  window.addEventListener('demo-auth-required', handleAuthRequired)
  window.addEventListener('demo-auth-logged-out', refreshAuthStatus)
})

onBeforeUnmount(() => {
  window.removeEventListener('demo-auth-required', handleAuthRequired)
  window.removeEventListener('demo-auth-logged-out', refreshAuthStatus)
})
</script>

<style scoped>
.auth-splash {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background:
    var(--craft-fiber),
    radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--ui-sage) 16%, transparent), transparent 36%),
    var(--rl-bg);
  color: var(--rl-text-secondary);
}

.auth-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--rl-border);
  border-top-color: var(--ui-sap);
  border-radius: 50%;
  animation: auth-spin 0.8s linear infinite;
}

@keyframes auth-spin {
  to {
    transform: rotate(360deg);
  }
}

.app-root {
  position: relative;
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(64, 88, 59, 0.08) 0 1px, transparent 1px),
    var(--craft-fiber),
    var(--rl-bg);
  background-size: 34px 34px, 180px 180px, auto;
}

.app-root::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 249, 234, 0.52), transparent 18%),
    radial-gradient(circle at 86% 10%, color-mix(in srgb, var(--ui-gold) 14%, transparent), transparent 22%);
  mix-blend-mode: multiply;
}

.app-main {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 240px;
  transition: margin-left 0.3s ease;
}

.app-main.sidebar-collapsed {
  margin-left: 64px;
}

.app-content {
  flex: 1;
  overflow: auto;
  padding: 22px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--ui-paper) 60%, transparent), transparent 120px),
    transparent;
}
</style>
