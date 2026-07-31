import { ExtensionCategory, Rect, register } from '@antv/g6'

const NODE_TYPE = 'opinion-card'
let registered = false

class OpinionCardNode extends Rect {
  render(attributes = this.parsedAttributes, container) {
    super.render({ ...attributes, labelText: '' }, container)
    const [width, height] = this.getSize(attributes)
    const compact = attributes.compact === true
    const core = attributes.core === true
    const stripeColor = attributes.typeColor || '#74716b'
    const riskColor = {
      critical: '#9b3131',
      high: '#a6533f',
      medium: '#9d7b32',
      low: '#4f766c'
    }[attributes.riskLevel] || '#74716b'
    const riskLabel = {
      critical: '重大',
      high: '高',
      medium: '中',
      low: '低'
    }[attributes.riskLevel] || '中性'

    this.upsert('type-stripe', 'rect', {
      x: -width / 2,
      y: -height / 2,
      width: core ? 6 : 4,
      height,
      fill: stripeColor
    }, container)

    if (core) {
      this.upsert('core-halo', 'rect', {
        x: -width / 2 - 4,
        y: -height / 2 - 4,
        width: width + 8,
        height: height + 8,
        radius: 7,
        fill: 'transparent',
        stroke: '#b99a4a',
        lineWidth: 1,
        lineDash: [4, 3],
        opacity: 0.72
      }, container)
    }

    this.upsert('title', 'text', {
      x: -width / 2 + 13,
      y: compact ? 0 : -11,
      text: attributes.title || '',
      fill: attributes.textColor || '#202225',
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: compact ? 11 : 12,
      fontWeight: 600,
      textAlign: 'left',
      textBaseline: 'middle',
      maxWidth: compact ? width - 56 : width - 28,
      textOverflow: 'ellipsis'
    }, container)

    if (!compact) {
      this.upsert('meta', 'text', {
        x: -width / 2 + 13,
        y: 10,
        text: `${attributes.typeLabel || '主体'} · 影响 ${attributes.influence ?? '-'}`,
        fill: attributes.mutedColor || '#73716c',
        fontFamily: '"Noto Sans SC", sans-serif',
        fontSize: 9,
        textAlign: 'left',
        textBaseline: 'middle',
        maxWidth: width - 42,
        textOverflow: 'ellipsis'
      }, container)

    }

    const badgeWidth = riskLabel === '重大' ? 27 : 19
    const badgeX = width / 2 - badgeWidth - 7
    const badgeY = compact ? -8 : height / 2 - 18
    this.upsert('risk-badge', 'rect', {
      x: badgeX,
      y: badgeY,
      width: badgeWidth,
      height: 12,
      radius: 2,
      fill: '#ffffff',
      stroke: riskColor,
      lineWidth: 1,
      lineDash: attributes.riskLevel === 'high'
        ? [4, 2]
        : attributes.riskLevel === 'medium'
          ? [1, 2]
          : undefined
    }, container)

    this.upsert('risk-label', 'text', {
      x: badgeX + badgeWidth / 2,
      y: badgeY + 6.5,
      text: riskLabel,
      fill: riskColor,
      fontFamily: '"Noto Sans SC", sans-serif',
      fontSize: 7.5,
      fontWeight: 600,
      textAlign: 'center',
      textBaseline: 'middle'
    }, container)

    // Small, geometry-based texture marks keep risk distinguishable without
    // relying only on color. They render consistently on G Canvas/WebGL.
    const patternY = badgeY + 2
    if (attributes.riskLevel === 'critical' || attributes.riskLevel === 'high') {
      ;[0, 1, 2].forEach((index) => {
        this.upsert(`risk-hatch-${index}`, 'line', {
          x1: badgeX + 2 + index * 4,
          y1: patternY + 7,
          x2: badgeX + 6 + index * 4,
          y2: patternY + 3,
          stroke: riskColor,
          opacity: 0.2,
          lineWidth: 0.7
        }, container)
      })
    } else if (attributes.riskLevel === 'medium') {
      ;[0, 1, 2].forEach((index) => {
        this.upsert(`risk-dot-${index}`, 'circle', {
          cx: badgeX + 3 + index * 4,
          cy: patternY + 6,
          r: 0.8,
          fill: riskColor,
          opacity: 0.28
        }, container)
      })
    } else {
      this.upsert('risk-grid-h', 'line', {
        x1: badgeX + 2,
        y1: patternY + 6,
        x2: badgeX + badgeWidth - 2,
        y2: patternY + 6,
        stroke: riskColor,
        opacity: 0.2,
        lineWidth: 0.7
      }, container)
    }
  }
}

export function registerOpinionCardNode() {
  if (registered) return NODE_TYPE
  register(ExtensionCategory.NODE, NODE_TYPE, OpinionCardNode)
  registered = true
  return NODE_TYPE
}

export { NODE_TYPE }
