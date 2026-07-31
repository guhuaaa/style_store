<template>
  <section class="case-library" aria-labelledby="case-library-title">
    <header>
      <div><span>PUBLIC CASE ARCHIVE</span><h3 id="case-library-title">公开真实事件案例库</h3></div>
      <small>{{ total }} 个案例 · 版本 {{ libraryVersion || '—' }}</small>
    </header>

    <form class="case-filters" @submit.prevent="applyFilters">
      <label><span>关键词</span><input v-model.trim="filters.keyword" type="search" placeholder="机构、事件或摘要" /></label>
      <label>
        <span>行业</span>
        <select v-model="filters.industry">
          <option value="">全部行业</option>
          <option v-for="item in industries" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </label>
      <label><span>机制</span><input v-model.trim="filters.mechanism" type="text" placeholder="如 trust-erosion" /></label>
      <label><span>起始日期</span><input v-model="filters.start_date" type="date" /></label>
      <label><span>结束日期</span><input v-model="filters.end_date" type="date" /></label>
      <button type="submit" :disabled="loading">{{ loading ? '检索中' : '检索' }}</button>
    </form>

    <p v-if="errorMessage" class="case-empty error" role="alert">{{ errorMessage }}</p>
    <div v-else-if="loading && !items.length" class="case-empty">正在读取已核验案例…</div>
    <div v-else-if="!items.length" class="case-empty">当前筛选条件下没有案例。</div>
    <div v-else class="case-layout">
      <div class="case-results" aria-live="polite">
        <button v-for="item in items" :key="item.id" type="button" :class="{ active: selected?.id === item.id }" @click="selected = item">
          <span class="case-meta">{{ industryLabel(item.industry) }} · {{ item.event_start }}</span>
          <strong>{{ item.title }}</strong>
          <p>{{ item.summary }}</p>
          <span class="case-tags"><i v-for="tag in item.ontology.mechanisms.slice(0, 3)" :key="tag">{{ tag }}</i></span>
        </button>
      </div>

      <aside v-if="selected" class="case-detail">
        <span class="case-meta">{{ selected.id }}</span>
        <h4>{{ selected.title }}</h4>
        <div class="case-boundary">案例用于机制对照，不可直接套用其结论或处置方案。</div>
        <p>{{ selected.summary }}</p>
        <dl>
          <div><dt>机构</dt><dd>{{ selected.organizations.join('、') }}</dd></div>
          <div><dt>地区</dt><dd>{{ selected.region }}</dd></div>
          <div><dt>风险等级</dt><dd>{{ severityLabel(selected.severity) }}</dd></div>
          <div><dt>核验日期</dt><dd>{{ selected.verified_at }}</dd></div>
        </dl>
        <section><h5>已核验事实</h5><ul><li v-for="fact in selected.editorial.verified_facts" :key="fact">{{ fact }}</li></ul></section>
        <section>
          <h5>传播与处置时间线</h5>
          <ol class="case-timeline">
            <li v-for="event in selected.timeline" :key="`${event.date}-${event.event}`">
              <time>{{ event.date }}</time><span>{{ event.event }}</span><em>{{ phaseLabel(event.phase) }}</em>
            </li>
          </ol>
        </section>
        <section v-if="selected.editorial.unknowns.length">
          <h5>未知与边界</h5><ul><li v-for="item in selected.editorial.unknowns" :key="item">{{ item }}</li></ul>
        </section>
        <div class="case-sources">
          <a v-for="source in selected.sources" :key="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">
            {{ source.publisher }} · {{ source.published_at }}
          </a>
        </div>
      </aside>
    </div>

    <footer v-if="total > pageSize" class="case-pagination">
      <button type="button" :disabled="page <= 1 || loading" @click="changePage(page - 1)">上一页</button>
      <span>第 {{ page }} / {{ pageCount }} 页</span>
      <button type="button" :disabled="page >= pageCount || loading" @click="changePage(page + 1)">下一页</button>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { listCases } from '../../api/analysis'

const industries = [
  { value: 'finance', label: '金融' }, { value: 'technology', label: '科技' },
  { value: 'consumer', label: '消费' }, { value: 'automotive', label: '汽车' },
  { value: 'aviation', label: '航空' }, { value: 'healthcare', label: '医疗健康' }
]
const filters = reactive({ keyword: '', industry: '', mechanism: '', start_date: '', end_date: '' })
const items = ref([])
const selected = ref(null)
const loading = ref(false)
const errorMessage = ref('')
const page = ref(1)
const pageSize = 10
const total = ref(0)
const libraryVersion = ref('')
const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

async function loadCases() {
  loading.value = true
  errorMessage.value = ''
  try {
    const params = { page: page.value, page_size: pageSize }
    Object.entries(filters).forEach(([key, value]) => { if (value) params[key] = value })
    const response = await listCases(params)
    items.value = response.data.items || []
    total.value = response.data.total || 0
    libraryVersion.value = response.data.library_version || ''
    selected.value = items.value.find(item => item.id === selected.value?.id) || items.value[0] || null
  } catch (error) {
    errorMessage.value = error.message || '案例库读取失败'
  } finally {
    loading.value = false
  }
}
function applyFilters() { page.value = 1; loadCases() }
function changePage(value) { page.value = value; loadCases() }
function industryLabel(value) { return industries.find(item => item.value === value)?.label || value }
function severityLabel(value) { return { low: '低', medium: '中', high: '高', critical: '重大' }[value] || value }
function phaseLabel(value) { return { trigger: '触发', spread: '传播', response: '处置', outcome: '结果' }[value] || value }
onMounted(loadCases)
</script>

<style scoped>
.case-library { color: var(--ui-ink); }
.case-library > header { display:flex; align-items:end; justify-content:space-between; gap:20px; padding-bottom:16px; border-bottom:1px solid var(--ui-border); }
.case-library > header span { color:var(--ui-gold); font-size:.66rem; font-weight:700; letter-spacing:.15em; }
.case-library h3 { margin:5px 0 0; font:650 1rem/1.4 'Noto Serif SC','Songti SC',serif; }
.case-library > header small,.case-meta { color:var(--ui-muted); font-size:.64rem; }
.case-filters { display:grid; grid-template-columns:1.3fr repeat(4,minmax(120px,.8fr)) auto; gap:10px; padding:16px 0; border-bottom:1px solid var(--ui-border); }
.case-filters label { display:grid; gap:5px; color:var(--ui-muted); font-size:.65rem; }
.case-filters input,.case-filters select { min-width:0; height:34px; border:1px solid var(--ui-border); border-radius:0; background:var(--ui-surface); color:var(--ui-ink); padding:0 9px; }
.case-filters button,.case-pagination button { border:1px solid var(--ui-charcoal); background:var(--ui-charcoal); color:var(--ui-paper); padding:0 15px; cursor:pointer; }
.case-filters button:disabled,.case-pagination button:disabled { opacity:.45; cursor:not-allowed; }
.case-layout { display:grid; grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr); min-height:520px; }
.case-results { border-right:1px solid var(--ui-border); }
.case-results > button { width:100%; display:grid; gap:6px; border:0; border-bottom:1px solid var(--ui-border); border-left:3px solid transparent; background:transparent; color:var(--ui-ink); padding:15px 18px 15px 12px; text-align:left; cursor:pointer; }
.case-results > button:hover,.case-results > button.active { border-left-color:var(--ui-gold); background:var(--ui-surface-muted); }
.case-results strong { font:650 .82rem/1.4 'Noto Serif SC',serif; }
.case-results p,.case-detail > p { margin:0; color:var(--ui-muted); font-size:.7rem; line-height:1.6; }
.case-tags { display:flex; flex-wrap:wrap; gap:5px; }
.case-tags i { border:1px solid var(--ui-border); padding:2px 5px; color:var(--ui-graphite); font-size:.58rem; font-style:normal; }
.case-detail { padding:20px 0 20px 24px; }
.case-detail h4 { margin:7px 0 10px; font:650 1rem/1.45 'Noto Serif SC',serif; }
.case-boundary { margin:0 0 10px; border-left:2px solid var(--ui-gold); background:var(--ui-surface-muted); color:var(--ui-graphite); padding:7px 9px; font-size:.65rem; line-height:1.5; }
.case-detail dl { margin:18px 0; border-top:1px solid var(--ui-border); }
.case-detail dl div { display:grid; grid-template-columns:72px 1fr; gap:12px; padding:8px 0; border-bottom:1px solid var(--ui-border); font-size:.68rem; }
.case-detail dt { color:var(--ui-muted); }.case-detail dd { margin:0; }
.case-detail section { margin-top:18px; }.case-detail h5 { margin:0 0 7px; font-size:.72rem; }
.case-detail ul { margin:0; padding-left:18px; color:var(--ui-muted); font-size:.68rem; line-height:1.65; }
.case-timeline { display:grid; gap:8px; margin:0; padding:0; list-style:none; }
.case-timeline li { display:grid; grid-template-columns:74px 1fr auto; gap:8px; align-items:start; color:var(--ui-muted); font-size:.66rem; line-height:1.5; }
.case-timeline time { color:var(--ui-ink); font-variant-numeric:tabular-nums; }
.case-timeline em { border:1px solid var(--ui-border); padding:1px 4px; color:var(--ui-graphite); font-size:.58rem; font-style:normal; }
.case-sources { display:grid; gap:6px; margin-top:20px; }
.case-sources a { color:var(--ui-gold); font-size:.66rem; text-decoration-thickness:1px; text-underline-offset:3px; }
.case-empty { padding:60px 0; color:var(--ui-muted); text-align:center; font-size:.76rem; }.case-empty.error { color:var(--ui-risk-high); }
.case-pagination { display:flex; align-items:center; justify-content:center; gap:14px; padding-top:16px; border-top:1px solid var(--ui-border); color:var(--ui-muted); font-size:.68rem; }
.case-pagination button { min-height:30px; }
button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible { outline:2px solid var(--ui-gold); outline-offset:2px; }
@media (max-width:1000px) { .case-filters { grid-template-columns:repeat(2,minmax(0,1fr)); }.case-filters button { min-height:34px; } }
@media (max-width:720px) { .case-library > header { align-items:start; flex-direction:column; }.case-filters,.case-layout { grid-template-columns:1fr; }.case-results { border-right:0; }.case-detail { padding-left:0; border-top:1px solid var(--ui-border); } }
</style>
