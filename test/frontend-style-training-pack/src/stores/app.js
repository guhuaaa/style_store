import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useAppStore = defineStore('app', () => {
  // 主题模式
  const theme = ref(localStorage.getItem('rl-theme') || 'light')
  
  // 侧边栏折叠
  const sidebarCollapsed = ref(false)
  
  // 系统日志
  const systemLogs = ref([])
  
  // 计算属性
  const isDark = computed(() => theme.value === 'dark')
  
  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  
  // 切换侧边栏
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
  
  // 添加日志
  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString('zh-CN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }) + '.' + new Date().getMilliseconds().toString().padStart(3, '0')
    
    systemLogs.value.push({ time, msg, type })
    if (systemLogs.value.length > 200) {
      systemLogs.value.shift()
    }
  }
  
  // 清空日志
  const clearLogs = () => {
    systemLogs.value = []
  }
  
  // 监听主题变化
  watch(theme, (newTheme) => {
    localStorage.setItem('rl-theme', newTheme)
    const html = document.documentElement
    if (newTheme === 'dark') {
      html.classList.add('dark')
      html.classList.remove('light')
    } else {
      html.classList.add('light')
      html.classList.remove('dark')
    }
  }, { immediate: true })
  
  return {
    theme,
    isDark,
    sidebarCollapsed,
    systemLogs,
    toggleTheme,
    toggleSidebar,
    addLog,
    clearLogs
  }
})
