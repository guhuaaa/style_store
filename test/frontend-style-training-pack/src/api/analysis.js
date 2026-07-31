import service from './index'

export const runOpinionAnalysis = data => service.post('/api/analysis/run', data)

export const getOpinionAnalysis = analysisId =>
  service.get(`/api/analysis/${encodeURIComponent(analysisId)}`)

export const getOpinionAnalysisStatus = analysisId =>
  service.get(`/api/analysis/${encodeURIComponent(analysisId)}/status`)

export const retryOpinionAnalysis = analysisId =>
  service.post(`/api/analysis/${encodeURIComponent(analysisId)}/retry`)

export const listCases = params => service.get('/api/analysis/cases', { params })

export const getCase = caseId =>
  service.get(`/api/analysis/cases/${encodeURIComponent(caseId)}`)

export const matchCases = data => service.post('/api/analysis/cases/match', data)
