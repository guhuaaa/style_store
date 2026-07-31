import service from './index'

export function checkGraphStorageStatus() {
  return service({
    url: '/api/graph/storage/status',
    method: 'get'
  })
}

export const checkNeo4jStatus = checkGraphStorageStatus

export function generateOntology(formData) {
  return service({
    url: '/api/graph/ontology/generate',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function buildGraph(data) {
  return service({
    url: '/api/graph/build',
    method: 'post',
    data
  })
}

export function getTaskStatus(taskId) {
  return service({
    url: `/api/graph/task/${taskId}`,
    method: 'get'
  })
}

export function getGraphData(graphId) {
  return service({
    url: `/api/graph/data/${graphId}`,
    method: 'get'
  })
}

export function getGraphNeighbors(graphId, nodeId, { depth = 2, limit = 200 } = {}) {
  return service({
    url: `/api/graph/data/${encodeURIComponent(graphId)}/neighbors/${encodeURIComponent(nodeId)}`,
    method: 'get',
    params: { depth, limit }
  })
}

export function getProject(projectId) {
  return service({
    url: `/api/graph/project/${projectId}`,
    method: 'get'
  })
}
