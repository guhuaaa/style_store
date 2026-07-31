import service from './index'

/**
 * 生成分析报告
 * @param {Object} data - { simulation_id, force_regenerate? }
 */
export const generateReport = (data) => {
  return service.post('/api/report/generate', data)
}

/**
 * 查询报告生成任务状态
 * @param {Object} data - { task_id?, simulation_id? }
 */
export const getReportStatus = (data) => {
  return service.post('/api/report/generate/status', data)
}

/**
 * 获取 Agent 日志（增量）
 * @param {string} reportId
 * @param {number} fromLine
 */
export const getAgentLog = (reportId, fromLine = 0) => {
  return service.get(`/api/report/${encodeURIComponent(reportId)}/agent-log`, {
    params: { from_line: fromLine }
  })
}

/**
 * 获取控制台日志（增量）
 * @param {string} reportId
 * @param {number} fromLine
 */
export const getConsoleLog = (reportId, fromLine = 0) => {
  return service.get(`/api/report/${encodeURIComponent(reportId)}/console-log`, {
    params: { from_line: fromLine }
  })
}

/**
 * 获取报告详情
 * @param {string} reportId
 */
export const getReport = (reportId) => {
  return service.get(`/api/report/${encodeURIComponent(reportId)}`)
}

/**
 * 根据仿真 ID 获取报告
 * @param {string} simulationId
 */
export const getReportBySimulation = (simulationId) => {
  return service.get(`/api/report/by-simulation/${encodeURIComponent(simulationId)}`)
}

/**
 * 获取报告列表
 * @param {Object} params - { simulation_id?, limit? }
 */
export const listReports = (params = {}) => {
  return service.get('/api/report/list', { params })
}

/**
 * 下载报告 Markdown
 * @param {string} reportId
 */
export const downloadReport = (reportId) => {
  return service.get(`/api/report/${encodeURIComponent(reportId)}/download`, {
    responseType: 'blob'
  })
}

/**
 * 与 Report Agent 对话
 * @param {Object} data - { simulation_id, message, chat_history? }
 */
export const chatWithReport = (data) => {
  return service.post('/api/report/chat', data)
}
