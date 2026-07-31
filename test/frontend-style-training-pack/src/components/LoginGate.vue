<template>
  <main class="login-gate" aria-labelledby="login-title">
    <section class="login-panel">
      <div class="brand-mark" aria-hidden="true">
        <el-icon size="28"><Lock /></el-icon>
      </div>

      <p class="eyebrow">公网预览访问</p>
      <h1 id="login-title">请输入访问口令</h1>
      <p class="description">该口令只用于打开演示网页，不是模型 API Key。</p>

      <form class="login-form" @submit.prevent="submitPassword">
        <label for="demo-password">访问口令</label>
        <el-input
          id="demo-password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          size="large"
          placeholder="输入访问口令"
          :disabled="loading"
          show-password
          autofocus
        />
        <p v-if="error" class="error-message" role="alert">{{ error }}</p>
        <el-button
          class="login-button"
          type="primary"
          native-type="submit"
          size="large"
          :loading="loading"
          :disabled="!password.trim()"
        >
          进入应用
        </el-button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { loginWithPassword } from '../api/auth'

const emit = defineEmits(['authenticated'])

const password = ref('')
const loading = ref(false)
const error = ref('')

async function submitPassword() {
  const value = password.value.trim()
  if (!value || loading.value) return

  loading.value = true
  error.value = ''

  try {
    await loginWithPassword(value)
    password.value = ''
    emit('authenticated')
  } catch (err) {
    error.value = err.message || '访问口令不正确'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-gate {
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    radial-gradient(circle at 20% 20%, color-mix(in srgb, var(--ui-sage) 28%, transparent), transparent 28%),
    radial-gradient(circle at 78% 12%, color-mix(in srgb, var(--ui-gold) 20%, transparent), transparent 24%),
    var(--craft-fiber),
    var(--rl-bg);
  color: var(--rl-text-primary);
}

.login-panel {
  position: relative;
  width: min(100%, 420px);
  border: 1px solid var(--rl-border);
  border-radius: var(--craft-radius);
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--rl-surface) 96%, transparent), color-mix(in srgb, var(--ui-paper) 26%, var(--rl-surface))),
    var(--craft-fiber);
  padding: 32px;
  box-shadow: var(--craft-shadow);
}

.login-panel::before {
  content: "";
  position: absolute;
  inset: 9px;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, var(--rl-border) 62%, transparent);
  border-radius: 3px;
}

.brand-mark {
  width: 56px;
  height: 56px;
  border-radius: var(--craft-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background:
    radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--ui-gold) 38%, transparent), transparent 34%),
    linear-gradient(135deg, var(--ui-sap), color-mix(in srgb, var(--ui-sap) 76%, var(--ui-ink)));
  margin-bottom: 24px;
  box-shadow: inset 0 0 0 1px rgba(255, 249, 234, 0.24);
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--rl-gold);
  font-size: 0.82rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', 'Noto Serif SC', serif;
  font-size: 1.75rem;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: 0;
}

.description {
  margin: 12px 0 24px;
  color: var(--rl-text-secondary);
  line-height: 1.6;
}

.login-form {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
}

label {
  color: var(--rl-text-secondary);
  font-size: 0.9rem;
  font-weight: 600;
}

.error-message {
  margin: 0;
  color: var(--rl-risk);
  font-size: 0.88rem;
  line-height: 1.5;
}

.login-button {
  min-height: 44px;
  margin-top: 4px;
}

@media (max-width: 520px) {
  .login-gate {
    padding: 16px;
  }

  .login-panel {
    padding: 24px;
  }
}
</style>
