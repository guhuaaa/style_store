import service from './index'

export function getAuthStatus() {
  return service.get('/api/auth/status')
}

export function loginWithPassword(password) {
  return service.post('/api/auth/login', { password })
}

export function logoutDemoAuth() {
  return service.post('/api/auth/logout')
}
