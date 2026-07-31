const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const csvPath = path.join(root, 'third_party', 'ui-ux-pro-max-skill', 'src', 'ui-ux-pro-max', 'data', 'styles.csv');
const outputDir = path.join(root, 'ui_ux_pro_max_previews_2026-07-29');
const manifestPath = path.join(root, 'design_style_library', 'sources', 'ui_ux_pro_max_preview_sources.json');
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]; const next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(cell); if (row.some(v => v.trim())) rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const header = rows.shift();
  return rows.map(values => Object.fromEntries(header.map((key, i) => [key.trim(), (values[i] || '').trim()])));
}

function slug(value) {
  return value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
function hash(value) { let h = 2166136261; for (const c of value) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function colors(record) {
  const found = (record['Primary Colors'] + ' ' + record['Secondary Colors']).match(/#[0-9A-Fa-f]{6}/g) || [];
  if (found.length >= 2) return [found[0], found[1]];
  const hue = hash(record['Style Category']) % 360;
  return [`hsl(${hue} 70% 50%)`, `hsl(${(hue + 48) % 360} 62% 48%)`];
}
function profile(name, keywords) {
  const q = `${name} ${keywords}`.toLowerCase();
  if (/glass|frost|transparent|blur/.test(q)) return 'glass';
  if (/neumorph|soft ui|emboss/.test(q)) return 'neumorph';
  if (/brutal|anti-design|raw/.test(q)) return 'brutal';
  if (/3d|hyperreal|skeuo|tactile/.test(q)) return 'depth';
  if (/dark|oled|cyber|neon/.test(q)) return 'dark';
  if (/retro|vintage|y2k|pixel|arcade/.test(q)) return 'retro';
  if (/editorial|magazine|typograph/.test(q)) return 'editorial';
  if (/bento|block|card grid/.test(q)) return 'bento';
  if (/minimal|swiss|scandinav|clean/.test(q)) return 'minimal';
  if (/clay|playful|organic|hand/.test(q)) return 'soft';
  if (/material|flat|corporate|enterprise/.test(q)) return 'system';
  return ['grid', 'layered', 'radial', 'split'][hash(name) % 4];
}
function html(record) {
  const name = record['Style Category']; const [a, b] = colors(record); const kind = profile(name, record.Keywords); const hue = hash(name) % 360;
  const dark = kind === 'dark'; const paper = dark ? '#121820' : '#f7f8fa'; const ink = dark ? '#f2f5f8' : '#17212b';
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:Inter,Segoe UI,Arial,sans-serif;background:${dark ? '#071017' : `hsl(${hue} 22% 91%)`};color:${ink}}.page{width:1440px;height:900px;padding:35px;background:linear-gradient(135deg,${a}22,transparent 42%),radial-gradient(circle at 87% 6%,${b}34,transparent 28%)}
  .app{height:100%;background:${paper};overflow:hidden;box-shadow:0 28px 70px #0003}.top{height:80px;border-bottom:1px solid ${ink}22;display:flex;align-items:center;justify-content:space-between;padding:0 28px}.brand{display:flex;align-items:center;gap:14px;font-size:21px;font-weight:760}.glyph{width:30px;height:30px;background:${a};border-radius:9px}.tag{font-size:11px;border:1px solid ${ink}33;padding:8px 12px;border-radius:20px}.layout{display:grid;grid-template-columns:200px 1fr;height:750px}.side{border-right:1px solid ${ink}22;padding:22px 14px}.side b{display:block;padding:12px;margin:4px 0;font-size:13px}.side .active{background:${a};color:#fff;border-radius:8px}.main{padding:28px}.intro{display:flex;justify-content:space-between;align-items:end}.intro h1{margin:4px 0 0;font-size:42px;letter-spacing:-.04em}.intro p{max-width:420px;font-size:13px;line-height:1.55}.eyebrow{font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:${a};font-weight:700}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:23px 0}.card,.panel{border:1px solid ${ink}20;background:${dark ? '#ffffff09' : '#fff'};padding:17px}.card small{font-size:11px}.card strong{display:block;font-size:30px;margin:14px 0 4px}.cards{display:grid;grid-template-columns:1.45fr .9fr;gap:14px}.panel{height:275px}.line{height:178px;margin-top:20px;background:linear-gradient(180deg,transparent 48%,${ink}10 49% 50%,transparent 51%),linear-gradient(90deg,transparent 24%,${ink}10 25% 26%,transparent 27% 49%,${ink}10 50% 51%,transparent 52% 74%,${ink}10 75% 76%,transparent 77%);position:relative}.line:after{content:"";position:absolute;inset:40px 14px 20px;background:linear-gradient(135deg,transparent 0 18%,${a} 19% 21%,transparent 22% 35%,${b} 36% 38%,transparent 39% 54%,${a} 55% 57%,transparent 58% 72%,${b} 73% 75%,transparent 76%);clip-path:polygon(0 62%,14% 48%,28% 55%,40% 23%,58% 47%,72% 15%,86% 30%,100% 4%,100% 100%,0 100%)}.nodes{display:flex;align-items:center;justify-content:center;height:190px;gap:28px}.node{width:54px;height:54px;border-radius:50%;background:${a};border:4px solid ${paper};box-shadow:0 0 0 2px ${ink}22}.node:nth-child(2){width:88px;height:88px;background:${b}}.node:nth-child(3){background:${a};transform:translateY(42px)}.node:nth-child(4){background:${b};transform:translateY(-34px)}
  .foot{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:14px;margin-top:14px}.foot .panel{height:132px}.row{display:flex;justify-content:space-between;border-top:1px solid ${ink}14;padding:9px 0;font-size:12px}.caption{position:absolute;right:50px;bottom:17px;font-size:9px;letter-spacing:.14em;color:${ink}88}
  ${kind === 'glass' ? `.app{background:linear-gradient(135deg,${a},${b});padding:20px}.top,.side,.card,.panel{background:#ffffff22;backdrop-filter:blur(18px);border-color:#fff5}.app{border-radius:26px}.card,.panel{border-radius:18px}` : ''}
  ${kind === 'neumorph' ? `.app{background:#e7edf3}.top,.side{border:0}.card,.panel{border:0;border-radius:18px;background:#e7edf3;box-shadow:9px 9px 20px #aab3bd,-9px -9px 20px #fff}.glyph{border-radius:50%;box-shadow:inset 4px 4px 8px #0002}` : ''}
  ${kind === 'brutal' ? `.app{box-shadow:none;border:5px solid #111}.top,.side,.card,.panel{border:3px solid #111;border-radius:0;box-shadow:none}.intro h1{font-size:52px;font-family:Arial Black,Arial,sans-serif;text-transform:uppercase}.glyph{border-radius:0}.card:nth-child(2n){background:${a};color:#fff}.panel:nth-child(2n){background:${b};color:#fff}` : ''}
  ${kind === 'depth' ? `.app{perspective:900px}.card,.panel{border-radius:15px;box-shadow:0 16px 0 ${a}24,0 28px 38px #0002}.cards{transform:rotateX(2deg)}.glyph{transform:rotate(36deg);border-radius:5px}` : ''}
  ${kind === 'dark' ? `.app{background:#091018}.card,.panel{background:#ffffff08;border-color:#fff2}.side{background:#0004}.top{background:#0003}.glyph{box-shadow:0 0 28px ${a}}.node{box-shadow:0 0 25px ${a}}` : ''}
  ${kind === 'retro' ? `.app{border:8px solid ${a};background:#151b3a;color:#f8f0c9}.top,.side{background:#1b2557}.card,.panel{border:3px solid #f8f0c9;background:#202b61}.intro h1{font-family:monospace;text-transform:uppercase}.glyph{border-radius:0}.line{image-rendering:pixelated}` : ''}
  ${kind === 'editorial' ? `.app{box-shadow:none}.top{border-bottom:4px solid ${ink}}.side{display:none}.layout{grid-template-columns:1fr}.main{padding:35px 70px}.intro h1{font-family:Georgia,serif;font-size:58px}.card,.panel{border-radius:0;border-top:4px solid ${ink}}.kpis{grid-template-columns:repeat(4,1fr)}` : ''}
  ${kind === 'bento' ? `.app{border-radius:28px}.side{display:none}.layout{grid-template-columns:1fr}.main{padding:32px}.kpis{grid-template-columns:1.5fr .8fr .8fr 1.2fr}.card,.panel{border-radius:22px}.card:first-child{background:${a};color:#fff}` : ''}
  ${kind === 'minimal' ? `.app{box-shadow:none}.side{padding-top:44px}.card,.panel{border-radius:0;box-shadow:none}.glyph{border-radius:50%}.intro h1{font-weight:450}.page{background:#fff}` : ''}
  ${kind === 'soft' ? `.app{border-radius:32px}.card,.panel{border:0;border-radius:24px;box-shadow:0 11px 26px ${a}24}.glyph{border-radius:50% 35% 55% 40%}.node{border-radius:42% 58% 40% 60%}` : ''}
  ${kind === 'system' ? `.card,.panel{border-radius:12px}.glyph{border-radius:7px}.top{box-shadow:0 1px 4px #0001}.card:first-child{border-top:3px solid ${a}}` : ''}
  ${kind === 'grid' ? `.app{background-image:linear-gradient(${ink}09 1px,transparent 1px),linear-gradient(90deg,${ink}09 1px,transparent 1px);background-size:28px 28px}.card,.panel{background:${paper}ee}` : ''}
  ${kind === 'layered' ? `.card,.panel{border-radius:14px;box-shadow:7px 8px 0 ${b}55}.main{transform:translate(-5px,-4px)}` : ''}
  ${kind === 'radial' ? `.page{background:radial-gradient(circle at 20% 12%,${a}88 0 10%,transparent 11%),radial-gradient(circle at 88% 82%,${b}77 0 12%,transparent 13%),hsl(${hue} 22% 91%)}` : ''}
  ${kind === 'split' ? `.app{background:linear-gradient(105deg,${paper} 0 69%,${a} 69% 100%)}.side{background:#ffffff33}.panel:last-child{background:#ffffff55}` : ''}
  </style></head><body><div class="page"><div class="app"><div class="top"><div class="brand"><i class="glyph"></i>Signal Atlas <span class="eyebrow">Style lab</span></div><span class="tag">${record['Era/Origin'] || 'UI/UX Pro Max'}</span></div><div class="layout"><aside class="side"><span class="eyebrow">Workspace</span><b class="active">Risk overview</b><b>Entity graph</b><b>Signal queue</b><b>Evidence</b><b>Settings</b></aside><main class="main"><section class="intro"><div><span class="eyebrow">UI/UX Pro Max · ${record.No}</span><h1>${name}</h1></div><p>${record.Keywords}</p></section><section class="kpis"><div class="card"><small>Entities watched</small><strong>2,486</strong><small>+12 today</small></div><div class="card"><small>Critical paths</small><strong>37</strong><small>−4 resolved</small></div><div class="card"><small>Evidence confidence</small><strong>91.6%</strong><small>+2.3%</small></div><div class="card"><small>Open signals</small><strong>128</strong><small>18 urgent</small></div></section><section class="cards"><div class="panel"><b>Transmission pressure · 30 days</b><div class="line"></div></div><div class="panel"><b>Relationship cluster</b><div class="nodes"><i class="node"></i><i class="node"></i><i class="node"></i><i class="node"></i></div></div></section><section class="foot"><div class="panel"><b>Priority signals</b><div class="row"><span>Liquidity linkage</span><b>Critical</b></div><div class="row"><span>Supplier concentration</span><b>High</b></div></div><div class="panel"><b>Scenario delta</b><h2>−18.4%</h2></div><div class="panel"><b>Evidence coverage</b><h2>84 / 92</h2></div></section></main></div><span class="caption">PROJECT-ORIGINAL RENDER · ${name.toUpperCase()}</span></div></div></body></html>`;
}

async function main() {
  if (!fs.existsSync(edge)) throw new Error('Microsoft Edge not found');
  const records = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  fs.rmSync(outputDir, { recursive: true, force: true }); fs.mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch({ executablePath: edge, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const manifest = {};
  for (const record of records) {
    const filename = `${String(record.No).padStart(2, '0')}_${slug(record['Style Category'])}.png`;
    await page.setContent(html(record), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(outputDir, filename) });
    manifest[filename] = { type: 'PROJECT_ORIGINAL_RENDER', source_type: 'UI_UX_PRO_MAX_STYLE_RULES', source_url: 'https://github.com/nextlevelbuilder/ui-ux-pro-max-skill', source_file: 'third_party/ui-ux-pro-max-skill/src/ui-ux-pro-max/data/styles.csv', style_name: record['Style Category'], source_license: 'MIT', captured_at: new Date().toISOString(), usage_scope: 'Local design research and visual reference; generated preview is project-authored HTML/CSS render.' };
    process.stdout.write(`${filename}\n`);
  }
  await browser.close();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`rendered=${records.length}`);
}
main().catch(error => { console.error(error); process.exit(1); });
