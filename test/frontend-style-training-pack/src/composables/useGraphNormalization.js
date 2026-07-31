import { computed, unref } from 'vue'
import {
  normalizeEntityType,
  normalizeRelationType,
  getEntityTypeConfig,
  getRelationTypeConfig,
  networkRoles,
  sentimentTypes
} from '../config/opinionGraph.js'

function firstPresent(...values) {
  return values.find(v => v !== undefined && v !== null && v !== '')
}

function asArray(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') return Object.values(value)
  return []
}

function normalizeEndpoint(value) {
  if (value && typeof value === 'object') {
    return firstPresent(
      value.uuid,
      value.uuid_,
      value.id,
      value.node_id,
      value.nodeId,
      value.source_node_uuid,
      value.target_node_uuid,
      value.name
    ) || ''
  }
  return value !== undefined && value !== null ? String(value) : ''
}

function resolveGraphPayload(payload) {
  let current = payload || {}
  for (let i = 0; i < 5; i += 1) {
    if (!current || typeof current !== 'object') return {}
    if (current.entities !== undefined || current.relationships !== undefined) return current
    if (current.nodes !== undefined || current.edges !== undefined) return current
    current = current.data
  }
  return {}
}

function safeString(value) {
  if (value === undefined || value === null) return ''
  return String(value)
}

export function useGraphNormalization(rawData) {
  const payload = computed(() => {
    const data = typeof rawData === 'function' ? rawData() : unref(rawData)
    return resolveGraphPayload(data)
  })

  const rawEntities = computed(() => {
    const p = payload.value
    return asArray(p.entities?.length ? p.entities : p.nodes)
  })

  const rawRelationships = computed(() => {
    const p = payload.value
    return asArray(p.relationships?.length ? p.relationships : p.edges)
  })

  const overview = computed(() => {
    const p = payload.value
    return p.overview || {}
  })

  const entities = computed(() => {
    const nodes = rawEntities.value.map((node) => {
      const item = typeof node === 'object' && node !== null ? node : { id: node, name: node }
      const attributes = item.attributes || {}
      const rawType = firstPresent(item.raw_type, item.rawType, attributes.raw_type, attributes.rawType, item.type)
      const normalizedType = normalizeEntityType(rawType)
      const config = getEntityTypeConfig(normalizedType)
      const uuid = normalizeEndpoint(firstPresent(item.uuid, item.uuid_, item.id, item.node_id, item.nodeId, item.name))
      const name = safeString(firstPresent(
        item.name,
        item.label,
        item.title,
        item.display_name,
        item.displayName,
        attributes.name,
        attributes.label,
        uuid
      ))

      return {
        ...item,
        id: uuid,
        uuid,
        name,
        rawType: safeString(rawType),
        type: normalizedType,
        typeLabel: config.label,
        typeRole: config.role,
        typeColor: config.color,
        typeShape: config.shape,
        typeIcon: config.icon,
        description: safeString(firstPresent(item.description, item.summary, item.content, attributes.summary, attributes.description, overview.value.summary)),
        stance: item.stance || attributes.stance || 'unknown',
        sentiment: item.sentiment || attributes.sentiment || 'neutral',
        camp: item.camp || attributes.camp || '',
        influence: Number.isFinite(Number(item.influence)) ? Number(item.influence) : null,
        networkRole: item.network_role || attributes.network_role || '',
        aliases: Array.isArray(item.aliases) ? item.aliases : [],
        evidenceCount: Number(item.evidence_count || attributes.evidence_count || 0),
        isAgentEligible: item.is_agent_eligible ?? item.isAgentEligible ?? attributes.is_agent_eligible ?? attributes.isAgentEligible,
        typeCategory: firstPresent(item.type_category, item.typeCategory, attributes.type_category, attributes.typeCategory, ''),
        degree: 0,
        inDegree: 0,
        outDegree: 0
      }
    }).filter(node => node.uuid && node.name)

    // 计算度
    const degreeMap = new Map()
    const inMap = new Map()
    const outMap = new Map()
    rawRelationships.value.forEach((edge) => {
      const item = typeof edge === 'object' && edge !== null ? edge : {}
      const source = normalizeEndpoint(firstPresent(
        item.source,
        item.source_node_uuid,
        item.source_uuid,
        item.source_id,
        item.sourceId,
        item.from,
        item.from_node_uuid,
        item.sourceNode
      ))
      const target = normalizeEndpoint(firstPresent(
        item.target,
        item.target_node_uuid,
        item.target_uuid,
        item.target_id,
        item.targetId,
        item.to,
        item.to_node_uuid,
        item.targetNode
      ))
      if (source && target) {
        degreeMap.set(source, (degreeMap.get(source) || 0) + 1)
        degreeMap.set(target, (degreeMap.get(target) || 0) + 1)
        outMap.set(source, (outMap.get(source) || 0) + 1)
        inMap.set(target, (inMap.get(target) || 0) + 1)
      }
    })

    return nodes.map((node) => {
      const degree = degreeMap.get(node.uuid) || 0
      const inDegree = inMap.get(node.uuid) || 0
      const outDegree = outMap.get(node.uuid) || 0
      return {
        ...node,
        degree,
        inDegree,
        outDegree,
        size: Math.min(40, 14 + Math.sqrt(Math.max(1, degree)) * 5)
      }
    })
  })

  const entityById = computed(() => new Map(entities.value.map(e => [e.uuid, e])))

  const relationships = computed(() => {
    const validIds = new Set(entities.value.map(e => e.uuid))
    return rawRelationships.value.map((edge) => {
      const item = typeof edge === 'object' && edge !== null ? edge : {}
      const attributes = item.attributes || {}
      const source = normalizeEndpoint(firstPresent(
        item.source,
        item.source_node_uuid,
        item.source_uuid,
        item.source_id,
        item.sourceId,
        item.from,
        item.from_node_uuid,
        item.sourceNode
      ))
      const target = normalizeEndpoint(firstPresent(
        item.target,
        item.target_node_uuid,
        item.target_uuid,
        item.target_id,
        item.targetId,
        item.to,
        item.to_node_uuid,
        item.targetNode
      ))
      const rawType = firstPresent(item.canonical_type, item.canonicalType, attributes.canonical_type, attributes.canonicalType, item.type, item.relationship, item.label, item.relation, item.name)
      const normalizedType = normalizeRelationType(rawType)
      const config = getRelationTypeConfig(normalizedType)
      const evidenceList = Array.isArray(item.evidence)
        ? item.evidence
        : (item.fact ? [{ text: item.fact, source: item.source_name || '', time: item.created_at || '' }] : [])

      return {
        ...item,
        id: item.uuid || item.id || `${source}->${target}:${normalizedType}`,
        source,
        target,
        sourceName: entityById.value.get(source)?.name || item.source_node_name || source,
        targetName: entityById.value.get(target)?.name || item.target_node_name || target,
        rawType: safeString(rawType),
        type: normalizedType,
        typeLabel: config.label,
        typeColor: config.color,
        directed: item.direction === 'directed' || config.directed,
        dashed: item.inferred || config.dashed,
        inferred: Boolean(item.inferred),
        confidence: Number.isFinite(Number(item.confidence)) ? Number(item.confidence) : 0.75,
        weight: Number.isFinite(Number(item.weight || item.score)) ? Number(item.weight || item.score) : 1,
        sentiment: item.sentiment || attributes.sentiment || config.emotion || 'neutral',
        firstTime: item.first_time || item.created_at || (evidenceList[0]?.time || ''),
        lastTime: item.last_time || item.created_at || (evidenceList[evidenceList.length - 1]?.time || ''),
        evidence: evidenceList,
        fact: safeString(firstPresent(item.fact, item.description, attributes.fact, attributes.description, ''))
      }
    }).filter(edge => validIds.has(edge.source) && validIds.has(edge.target))
  })

  const nodeDegrees = computed(() => {
    const map = new Map()
    entities.value.forEach(e => map.set(e.uuid, { degree: e.degree, inDegree: e.inDegree, outDegree: e.outDegree }))
    return map
  })

  const maxDegree = computed(() => Math.max(1, ...entities.value.map(e => e.degree)))

  const networkMetrics = computed(() => {
    const adjacency = new Map()
    relationships.value.forEach((edge) => {
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, [])
      if (!adjacency.has(edge.target)) adjacency.set(edge.target, [])
      adjacency.get(edge.source).push(edge.target)
      adjacency.get(edge.target).push(edge.source)
    })

    const betweenness = new Map()
    const nodes = entities.value
    nodes.forEach(n => betweenness.set(n.uuid, 0))

    nodes.forEach((s) => {
      const dist = new Map()
      const paths = new Map()
      const queue = []
      nodes.forEach(n => {
        dist.set(n.uuid, Infinity)
        paths.set(n.uuid, 0)
      })
      dist.set(s.uuid, 0)
      paths.set(s.uuid, 1)
      queue.push(s.uuid)

      const visited = []
      while (queue.length) {
        const v = queue.shift()
        visited.push(v)
        const neighbors = adjacency.get(v) || []
        neighbors.forEach((w) => {
          if (dist.get(w) === Infinity) {
            dist.set(w, dist.get(v) + 1)
            queue.push(w)
          }
          if (dist.get(w) === dist.get(v) + 1) {
            paths.set(w, paths.get(w) + paths.get(v))
          }
        })
      }

      const dependency = new Map()
      nodes.forEach(n => dependency.set(n.uuid, 0))
      while (visited.length) {
        const w = visited.pop()
        const neighbors = adjacency.get(w) || []
        neighbors.forEach((v) => {
          if (dist.get(v) === dist.get(w) - 1) {
            dependency.set(v, dependency.get(v) + (paths.get(v) / paths.get(w)) * (1 + dependency.get(w)))
          }
        })
        if (w !== s.uuid) {
          betweenness.set(w, betweenness.get(w) + dependency.get(w))
        }
      }
    })

    const maxBetweenness = Math.max(1, ...betweenness.values())
    return { betweenness, maxBetweenness }
  })

  const entityNetworkRoles = computed(() => {
    const roleMap = new Map()
    const relationBySource = new Map()
    const relationByTarget = new Map()
    const relationTypesByNode = new Map()

    relationships.value.forEach((edge) => {
      relationBySource.set(edge.source, (relationBySource.get(edge.source) || 0) + 1)
      relationByTarget.set(edge.target, (relationByTarget.get(edge.target) || 0) + 1)
      if (!relationTypesByNode.has(edge.source)) relationTypesByNode.set(edge.source, new Set())
      if (!relationTypesByNode.has(edge.target)) relationTypesByNode.set(edge.target, new Set())
      relationTypesByNode.get(edge.source).add(edge.type)
      relationTypesByNode.get(edge.target).add(edge.type)
    })

    const maxBetweenness = networkMetrics.value.maxBetweenness
    entities.value.forEach((node) => {
      const out = relationBySource.get(node.uuid) || 0
      const inn = relationByTarget.get(node.uuid) || 0
      const types = relationTypesByNode.get(node.uuid) || new Set()
      const hasConflict = types.has('oppose') || types.has('conflict')
      const hasSupport = types.has('support')
      const betweenness = networkMetrics.value.betweenness.get(node.uuid) || 0
      const normalizedBetweenness = betweenness / maxBetweenness

      let role = 'peripheral'
      if (hasConflict && hasSupport) {
        role = 'controversy'
      } else if (out >= 3 && inn >= 3) {
        role = 'hub'
      } else if (out >= 4 && inn < 3) {
        role = 'source'
      } else if (normalizedBetweenness > 0.15) {
        role = 'bridge'
      }

      roleMap.set(node.uuid, {
        role,
        label: networkRoles[role].label,
        desc: networkRoles[role].desc,
        betweenness: Number.isFinite(normalizedBetweenness) ? normalizedBetweenness : 0
      })
    })

    return roleMap
  })

  const enrichedEntities = computed(() => {
    return entities.value.map((node) => {
      const roleInfo = entityNetworkRoles.value.get(node.uuid) || { role: 'peripheral', label: '边缘参与者', desc: '', betweenness: 0 }
      const influence = node.influence !== null
        ? node.influence
        : Math.round((node.degree / maxDegree.value) * 60 + roleInfo.betweenness * 40)
      return {
        ...node,
        networkRole: roleInfo.role,
        networkRoleLabel: roleInfo.label,
        networkRoleDesc: roleInfo.desc,
        influence: Math.min(100, Math.max(0, influence))
      }
    })
  })

  const enrichedEntityById = computed(() => new Map(enrichedEntities.value.map(e => [e.uuid, e])))

  const camps = computed(() => {
    const campMap = new Map()
    enrichedEntities.value.forEach((node) => {
      if (!node.camp) return
      if (!campMap.has(node.camp)) {
        campMap.set(node.camp, { key: node.camp, name: node.camp, entities: [], stances: new Set() })
      }
      campMap.get(node.camp).entities.push(node)
      campMap.get(node.camp).stances.add(node.stance)
    })
    return [...campMap.values()].map(camp => ({
      ...camp,
      entityCount: camp.entities.length,
      stanceSummary: [...camp.stances].join(' / ') || '未明确'
    }))
  })

  const overallSentiment = computed(() => {
    const known = relationships.value.filter(r => r.sentiment && r.sentiment !== 'neutral')
    if (!known.length) return overview.value.overall_sentiment || 'neutral'
    const negative = known.filter(r => r.sentiment === 'negative').length
    const positive = known.filter(r => r.sentiment === 'positive').length
    if (negative > positive * 1.5) return 'negative'
    if (positive > negative * 1.5) return 'positive'
    return 'mixed'
  })

  const derivedOverview = computed(() => {
    const sentiment = overallSentiment.value
    return {
      title: overview.value.title || '未命名舆情事件',
      summary: overview.value.summary || '',
      entityCount: enrichedEntities.value.length,
      relationshipCount: relationships.value.length,
      campCount: camps.value.length,
      overallSentiment: sentiment,
      overallSentimentLabel: sentimentTypes[sentiment]?.label || '中性',
      overallSentimentColor: sentimentTypes[sentiment]?.color || '#8E8C86',
      keyEntities: overview.value.key_entities || enrichedEntities.value.slice().sort((a, b) => b.influence - a.influence).slice(0, 5),
      camps: overview.value.camps || camps.value,
      controversies: overview.value.controversies || [],
      timeline: overview.value.timeline || []
    }
  })

  return {
    entities: enrichedEntities,
    entityById: enrichedEntityById,
    relationships,
    overview: derivedOverview,
    camps
  }
}
