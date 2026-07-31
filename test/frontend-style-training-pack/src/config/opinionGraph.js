/**
 * 舆情主体关联图谱统一配置
 * 集中管理主体类型、关系类型、颜色、形状、标签与视觉语义
 */

// 视觉系统：克制、专业、编辑感
export const opinionTheme = {
  // 背景与表面
  bg: '#F5F4F0',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAF8',
  surfaceHover: '#F0EEEA',
  border: '#E3E1DC',
  divider: '#DEDCD6',

  // 文字
  textPrimary: '#202225',
  textSecondary: '#5A5852',
  textMuted: '#73716C',

  // 主题与强调
  primary: '#4056A1',
  primaryLight: '#5A74C0',
  danger: '#C75C5C',
  dangerLight: '#D97A7A',
  safe: '#5A9A8F',
  safeLight: '#7AB3AA',
  warning: '#C89F5E',

  // 辅助色
  slate: '#7A8699',
  warmGrey: '#9B958C',
  ink: '#2C2E33'
}

// 主体类型配置：颜色 + 形状 + 图标 + 中文标签 + 角色说明
export const entityTypes = {
  government: {
    label: '政府/监管',
    role: '政策制定与监管约束',
    color: '#4056A1',
    shape: 'hexagon',
    icon: 'ScaleToOriginal'
  },
  media: {
    label: '新闻媒体',
    role: '公开报道与舆情扩散',
    color: '#6B7B8C',
    shape: 'roundedSquare',
    icon: 'Document'
  },
  enterprise: {
    label: '企业/品牌',
    role: '产品、服务与责任主体',
    color: '#C89F5E',
    shape: 'square',
    icon: 'OfficeBuilding'
  },
  platform: {
    label: '互联网平台',
    role: '信息分发与讨论场域',
    color: '#8B7FAE',
    shape: 'diamond',
    icon: 'Monitor'
  },
  institution: {
    label: '研究机构',
    role: '专业分析与第三方背书',
    color: '#5A9A8F',
    shape: 'circle',
    icon: 'School'
  },
  expert: {
    label: '专家/学者',
    role: '专业解读与意见输出',
    color: '#4A8C9B',
    shape: 'circle',
    icon: 'UserFilled'
  },
  influencer: {
    label: '意见领袖/KOL',
    role: '情绪放大与话题引导',
    color: '#C75C5C',
    shape: 'ring',
    icon: 'Star'
  },
  public_group: {
    label: '公众群体',
    role: '群体情绪与传播参与',
    color: '#7D9471',
    shape: 'cluster',
    icon: 'User'
  },
  individual: {
    label: '普通个人',
    role: '个体诉求与经验分享',
    color: '#8E8C86',
    shape: 'circleSmall',
    icon: 'Avatar'
  },
  event: {
    label: '核心事件',
    role: '舆情焦点与争议源头',
    color: '#2C2E33',
    shape: 'core',
    icon: 'WarningFilled'
  },

  // 兼容旧类型映射
  investor: { label: '投资者/个人', role: '权益与诉求来源', color: '#C89F5E', shape: 'circle', icon: 'User' },
  institution_legacy: { label: '金融机构', role: '业务与责任主体', color: '#4056A1', shape: 'square', icon: 'OfficeBuilding' },
  regulator: { label: '监管机构', role: '监管约束', color: '#4056A1', shape: 'hexagon', icon: 'ScaleToOriginal' },
  media_legacy: { label: '媒体', role: '传播主体', color: '#6B7B8C', shape: 'roundedSquare', icon: 'Document' },
  product: { label: '产品/资产', role: '风险承载对象', color: '#5A9A8F', shape: 'square', icon: 'Goods' },
  risk: { label: '风险事件', role: '争议焦点', color: '#C75C5C', shape: 'core', icon: 'WarningFilled' },
  other: { label: '其他主体', role: '未归类实体', color: '#8E8C86', shape: 'circle', icon: 'QuestionFilled' }
}

// 类型别名映射：将后端/旧类型归一化为标准类型
export const entityTypeAliases = {
  // 政府/监管
  government: 'government',
  regulator: 'government',
  regulatoryagency: 'government',
  financialregulator: 'government',
  监管: 'government',
  监管机构: 'government',
  政府: 'government',

  // 媒体
  media: 'media',
  mediaoutlet: 'media',
  financialmedia: 'media',
  selfmedia: 'media',
  mediaagency: 'media',
  媒体: 'media',
  新闻媒体: 'media',

  // 企业/品牌
  enterprise: 'enterprise',
  company: 'enterprise',
  bank: 'enterprise',
  financialinstitution: 'enterprise',
  trustcompany: 'enterprise',
  securitiescompany: 'enterprise',
  assetmanagementcompany: 'enterprise',
  wealthmanagementcompany: 'enterprise',
  saleschannel: 'enterprise',
  custodianbank: 'enterprise',
  securitiescustodian: 'enterprise',
  公司: 'enterprise',
  企业: 'enterprise',
  银行: 'enterprise',
  金融机构: 'enterprise',

  // 平台
  platform: 'platform',
  wechatgroup: 'platform',
  social: 'platform',
  privatechatgroup: 'platform',
  平台: 'platform',
  微信群: 'platform',
  私域群: 'platform',

  // 研究机构
  institution: 'institution',
  organization: 'institution',
  professionalservice: 'institution',
  机构: 'institution',
  组织: 'institution',

  // 专家
  expert: 'expert',
  analyst: 'expert',
  financialanalyst: 'expert',
  industryanalyst: 'expert',
  auditor: 'expert',
  legalprofessional: 'expert',
  专家: 'expert',
  学者: 'expert',
  分析师: 'expert',

  // KOL
  influencer: 'influencer',
  publicfigure: 'influencer',
  意见领袖: 'influencer',
  kol: 'influencer',
  自媒体: 'influencer',

  // 公众群体
  public_group: 'public_group',
  public: 'public_group',
  customer: 'public_group',
  client: 'public_group',
  公众: 'public_group',
  群体: 'public_group',
  投资者: 'public_group',

  // 个人
  individual: 'individual',
  person: 'individual',
  executive: 'individual',
  investor_legacy: 'individual',
  个人: 'individual',
  人物: 'individual',

  // 核心事件
  event: 'event',
  riskevent: 'event',
  complaint: 'event',
  topic: 'event',
  disclosure: 'event',
  mediareport: 'event',
  事件: 'event',
  风险事件: 'event',
  投诉: 'event',
  议题: 'event'
}

// 关系类型配置：颜色、方向、强度语义
export const relationTypes = {
  support: {
    label: '支持/认同',
    color: '#5A9A8F',
    directed: true,
    dashed: false,
    emotion: 'positive'
  },
  oppose: {
    label: '反对/质疑',
    color: '#C75C5C',
    directed: true,
    dashed: false,
    emotion: 'negative'
  },
  respond: {
    label: '回应/澄清',
    color: '#4056A1',
    directed: true,
    dashed: false,
    emotion: 'neutral'
  },
  mention: {
    label: '提及',
    color: '#8E8C86',
    directed: true,
    dashed: false,
    emotion: 'neutral'
  },
  quote: {
    label: '引用',
    color: '#7A8699',
    directed: true,
    dashed: false,
    emotion: 'neutral'
  },
  spread: {
    label: '转发/传播',
    color: '#6B7B8C',
    directed: true,
    dashed: false,
    emotion: 'neutral'
  },
  cooperate: {
    label: '合作/联合',
    color: '#5A9A8F',
    directed: false,
    dashed: false,
    emotion: 'positive'
  },
  supervise: {
    label: '监管/调查',
    color: '#4056A1',
    directed: true,
    dashed: false,
    emotion: 'neutral'
  },
  belong: {
    label: '隶属/任职',
    color: '#9B958C',
    directed: true,
    dashed: false,
    emotion: 'neutral'
  },
  interest: {
    label: '利益关联',
    color: '#C89F5E',
    directed: false,
    dashed: true,
    emotion: 'neutral'
  },
  conflict: {
    label: '直接冲突',
    color: '#C75C5C',
    directed: false,
    dashed: false,
    emotion: 'negative'
  },
  neutral: {
    label: '一般关联',
    color: '#8E8C86',
    directed: false,
    dashed: false,
    emotion: 'neutral'
  }
}

// 关系类型别名映射
export const relationTypeAliases = {
  support: 'support',
  支持: 'support',
  认同: 'support',
  声援: 'support',
  endorse: 'support',

  oppose: 'oppose',
  反对: 'oppose',
  质疑: 'oppose',
  批评: 'oppose',
  criticize: 'oppose',
  attack: 'oppose',

  respond: 'respond',
  回应: 'respond',
  澄清: 'respond',
  reply: 'respond',
  answer: 'respond',

  mention: 'mention',
  提及: 'mention',
  mention: 'mention',
  refer: 'mention',

  quote: 'quote',
  引用: 'quote',
  转载: 'quote',
  cite: 'quote',

  spread: 'spread',
  传播: 'spread',
  转发: 'spread',
  扩散: 'spread',
  share: 'spread',

  cooperate: 'cooperate',
  合作: 'cooperate',
  联合: 'cooperate',
  collaborate: 'cooperate',

  supervise: 'supervise',
  监管: 'supervise',
  调查: 'supervise',
  处罚: 'supervise',
  investigate: 'supervise',

  belong: 'belong',
  隶属: 'belong',
  任职: 'belong',
  belongto: 'belong',
  partof: 'belong',

  interest: 'interest',
  利益关联: 'interest',
  关联: 'interest',
  relatedto: 'interest',

  conflict: 'conflict',
  冲突: 'conflict',
  矛盾: 'conflict',
  dispute: 'conflict',

  neutral: 'neutral',
  关联: 'neutral',
  related: 'neutral',
  相关: 'neutral'
}

// 立场类型
export const stanceTypes = {
  support: { label: '支持方', color: '#5A9A8F' },
  oppose: { label: '质疑方', color: '#C75C5C' },
  neutral: { label: '中立', color: '#8E8C86' },
  unknown: { label: '未明确', color: '#B0ADA6' }
}

// 情感倾向
export const sentimentTypes = {
  positive: { label: '正面', color: '#5A9A8F' },
  negative: { label: '负面', color: '#C75C5C' },
  neutral: { label: '中性', color: '#8E8C86' },
  mixed: { label: '混合', color: '#C89F5E' }
}

// 网络角色
export const networkRoles = {
  source: { label: '信息源', desc: '多起关系的起点，常是爆料或公告源头' },
  hub: { label: '传播枢纽', desc: '连接多个主体，信息流转的关键节点' },
  controversy: { label: '争议中心', desc: '同时存在支持与反对关系的高冲突节点' },
  bridge: { label: '阵营桥梁', desc: '连接不同阵营的中间节点' },
  peripheral: { label: '边缘参与者', desc: '关联较少，处于网络边缘' }
}

// 布局模式
export const layoutModes = {
  network: { label: '关系网络', desc: '力导向布局，突出连接结构' },
  group: { label: '阵营分组', desc: '按立场/类型分组，便于识别阵营' }
}

// 辅助函数
export function normalizeEntityType(rawType) {
  if (!rawType) return 'other'
  const key = String(rawType).toLowerCase().replace(/[^a-z\u4e00-\u9fa5]/g, '')
  return entityTypeAliases[key] || 'other'
}

export function normalizeRelationType(rawType) {
  if (!rawType) return 'neutral'
  const key = String(rawType).toLowerCase().replace(/[^a-z\u4e00-\u9fa5]/g, '')
  return relationTypeAliases[key] || 'neutral'
}

export function getEntityTypeConfig(type) {
  return entityTypes[normalizeEntityType(type)] || entityTypes.other
}

export function getRelationTypeConfig(type) {
  return relationTypes[normalizeRelationType(type)] || relationTypes.neutral
}
