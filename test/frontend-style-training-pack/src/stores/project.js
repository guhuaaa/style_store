import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useProjectStore = defineStore('project', () => {
  // 项目列表
  const projects = ref([])
  
  // 当前项目
  const currentProject = ref(null)
  
  // 当前模拟
  const currentSimulation = ref(null)
  
  // 当前报告
  const currentReport = ref(null)
  
  // 图谱数据
  const graphData = ref(null)
  
  // 加载状态
  const loading = ref(false)
  
  // 错误信息
  const error = ref('')
  
  // 当前阶段：-1 未开始, 0 数据接入, 1 图谱构建, 2 环境建模, 3 风险推演, 4 报告生成, 5 深度研判
  const currentPhase = ref(-1)
  
  // 计算属性
  const currentProjectId = computed(() => currentProject.value?.project_id || null)
  const hasGraphData = computed(() => !!graphData.value && !!graphData.value.nodes?.length)
  
  const setProjects = (list) => {
    projects.value = list
  }
  
  const setCurrentProject = (project) => {
    currentProject.value = project
  }
  
  const setCurrentSimulation = (simulation) => {
    currentSimulation.value = simulation
  }
  
  const setCurrentReport = (report) => {
    currentReport.value = report
  }
  
  const setGraphData = (data) => {
    graphData.value = data
  }
  
  const setLoading = (value) => {
    loading.value = value
  }
  
  const setError = (msg) => {
    error.value = msg
  }
  
  const setPhase = (phase) => {
    currentPhase.value = phase
  }
  
  const reset = () => {
    currentProject.value = null
    currentSimulation.value = null
    currentReport.value = null
    graphData.value = null
    currentPhase.value = -1
    error.value = ''
  }
  
  return {
    projects,
    currentProject,
    currentSimulation,
    currentReport,
    graphData,
    loading,
    error,
    currentPhase,
    currentProjectId,
    hasGraphData,
    setProjects,
    setCurrentProject,
    setCurrentSimulation,
    setCurrentReport,
    setGraphData,
    setLoading,
    setError,
    setPhase,
    reset
  }
})
