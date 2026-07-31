import { computed } from 'vue'
import { useAppStore } from '../stores/app.js'

const FALLBACK = {
  ink: '#111111',
  paper: '#faf9f5',
  surface: '#ffffff',
  charcoal: '#222222',
  graphite: '#555555',
  muted: '#716e67',
  border: '#d8d5cc',
  gold: '#806a2d',
  critical: '#8f3030',
  high: '#a85a32',
  medium: '#9a7b2f',
  low: '#3f7465',
  neutral: '#77736c'
}

function token(name, fallback) {
  if (typeof document === 'undefined') return fallback
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
}

export function useThemePalette() {
  const appStore = useAppStore()
  return computed(() => {
    // Reading the theme makes Canvas chart options update after a theme switch.
    void appStore.theme
    return {
      ink: token('--ui-ink', FALLBACK.ink),
      paper: token('--ui-paper', FALLBACK.paper),
      surface: token('--ui-surface', FALLBACK.surface),
      charcoal: token('--ui-charcoal', FALLBACK.charcoal),
      graphite: token('--ui-graphite', FALLBACK.graphite),
      muted: token('--ui-muted', FALLBACK.muted),
      border: token('--ui-border', FALLBACK.border),
      gold: token('--ui-gold', FALLBACK.gold),
      critical: token('--ui-risk-critical', FALLBACK.critical),
      high: token('--ui-risk-high', FALLBACK.high),
      medium: token('--ui-risk-medium', FALLBACK.medium),
      low: token('--ui-risk-low', FALLBACK.low),
      neutral: FALLBACK.neutral
    }
  })
}
