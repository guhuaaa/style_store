const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = process.cwd();
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const styles = [
  { slug: 'fauvism', name: 'Fauvism', era: 'c. 1905-1910' },
  { slug: 'orphism', name: 'Orphism', era: 'c. 1912-1914' },
  { slug: 'vorticism', name: 'Vorticism', era: 'c. 1914-1919' },
  { slug: 'precisionism', name: 'Precisionism', era: 'c. 1915-1945' },
  { slug: 'abstract_expressionism', name: 'Abstract Expressionism', era: 'c. 1943-1965' },
  { slug: 'color_field', name: 'Color Field Painting', era: 'c. 1947-1970' },
  { slug: 'hard_edge', name: 'Hard-edge Painting', era: 'c. 1950-1970' },
  { slug: 'op_art', name: 'Op Art', era: 'c. 1960-1975' },
  { slug: 'minimalism_art', name: 'Minimalism', era: 'c. 1960-1975' },
  { slug: 'mexican_muralism', name: 'Mexican Muralism', era: 'c. 1920-1970' }
];

const nav = `
  <div class="brand"><span class="brand-mark"></span><b>OBSERVATORY</b></div>
  <div class="nav-group">
    <div class="nav active"><span>01</span>Overview</div>
    <div class="nav"><span>02</span>Evidence graph</div>
    <div class="nav"><span>03</span>Signals</div>
    <div class="nav"><span>04</span>Entities</div>
    <div class="nav"><span>05</span>Cases</div>
    <div class="nav"><span>06</span>Archive</div>
  </div>
  <div class="rail-foot">
    <div class="micro">LIVE INDEX</div>
    <div class="rail-num">12,804</div>
    <div class="rail-line"><i></i></div>
    <div class="micro">Evidence objects</div>
  </div>`;

const svgSpark = (stroke = 'currentColor') => `
<svg viewBox="0 0 220 58" preserveAspectRatio="none" aria-hidden="true">
  <path d="M2 46 C22 42 30 25 48 29 S78 51 95 35 S125 12 142 20 S170 49 188 27 S207 15 218 9"
    fill="none" stroke="${stroke}" stroke-width="3" vector-effect="non-scaling-stroke"/>
</svg>`;

const bars = `
  <div class="bars">
    <i style="height:42%"></i><i style="height:65%"></i><i style="height:51%"></i>
    <i style="height:79%"></i><i style="height:58%"></i><i style="height:92%"></i>
    <i style="height:72%"></i><i style="height:86%"></i><i style="height:61%"></i>
  </div>`;

const evidenceRows = `
  <div class="e-row"><b>Northbridge Logistics</b><span>Ownership conflict</span><strong>0.92</strong></div>
  <div class="e-row"><b>Aster Holdings</b><span>Hidden affiliation</span><strong>0.81</strong></div>
  <div class="e-row"><b>Meridian Works</b><span>Supplier exposure</span><strong>0.74</strong></div>
  <div class="e-row"><b>Delta Harbor Fund</b><span>Capital anomaly</span><strong>0.68</strong></div>`;

const baseCss = `
*{box-sizing:border-box}
html,body{margin:0;width:1536px;height:1024px;overflow:hidden}
body{font-family:Arial,Helvetica,sans-serif;background:var(--bg);color:var(--ink)}
.app{width:1536px;height:1024px;display:grid;grid-template-columns:220px 1fr;position:relative;overflow:hidden}
.rail{padding:30px 22px 24px;border-right:1px solid var(--line);display:flex;flex-direction:column;position:relative;z-index:3}
.brand{height:52px;display:flex;align-items:center;gap:11px;font-size:12px;letter-spacing:1.8px}
.brand-mark{width:22px;height:22px;display:inline-block;background:var(--accent)}
.nav-group{margin-top:52px;display:grid;gap:8px}
.nav{height:46px;padding:0 12px;display:flex;align-items:center;gap:14px;font-size:13px;border:1px solid transparent}
.nav span{font-size:10px;opacity:.55}
.nav.active{font-weight:700}
.rail-foot{margin-top:auto}
.micro{text-transform:uppercase;font-size:9px;letter-spacing:1.6px;opacity:.65}
.rail-num{font-size:34px;margin:7px 0 8px;font-weight:700;letter-spacing:-1.5px}
.rail-line{height:3px;background:var(--line);margin:8px 0 13px}
.rail-line i{display:block;height:100%;width:72%;background:var(--accent)}
.main{padding:28px 30px 26px;display:grid;grid-template-rows:86px 1fr;gap:18px;position:relative;z-index:2}
.topbar{display:flex;justify-content:space-between;align-items:flex-start}
.eyebrow{text-transform:uppercase;font-size:10px;letter-spacing:2px;opacity:.62}
h1{font-size:34px;line-height:1;margin:10px 0 0;letter-spacing:-1.6px}
.meta{display:flex;gap:10px;align-items:center}
.pill{padding:9px 12px;border:1px solid var(--line);font-size:10px;letter-spacing:.8px;text-transform:uppercase}
.pill.live:before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--accent);margin-right:7px}
.workspace{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:18px}
.center,.right{min-width:0;min-height:0}
.center{display:grid;grid-template-rows:220px 1fr;gap:18px}
.right{display:grid;grid-template-rows:245px 218px 1fr;gap:18px}
.card{position:relative;overflow:hidden;border:1px solid var(--line);background:var(--panel)}
.card-pad{padding:18px}
.card-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.card-title b{font-size:12px;text-transform:uppercase;letter-spacing:1.2px}
.card-title span{font-size:10px;opacity:.55}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.kpi{padding:16px;border:1px solid var(--line);min-height:120px}
.kpi small{font-size:9px;text-transform:uppercase;letter-spacing:1px;opacity:.62}
.kpi strong{display:block;font-size:31px;letter-spacing:-1.5px;margin:17px 0 5px}
.kpi em{font-style:normal;font-size:10px;opacity:.64}
.lower{display:grid;grid-template-columns:1.22fr .78fr;gap:18px;min-height:0}
.graph-card{min-height:0}
.graph{height:calc(100% - 42px);position:relative}
.graph svg{width:100%;height:100%;display:block}
.list{display:grid;gap:0}
.e-row{display:grid;grid-template-columns:1fr 1fr 50px;gap:10px;align-items:center;min-height:62px;border-top:1px solid var(--line);font-size:11px}
.e-row:first-child{border-top:0}
.e-row b{font-size:11px}
.e-row span{opacity:.62}
.e-row strong{text-align:right;font-size:12px}
.metric-ring{width:142px;height:142px;margin:3px auto 12px;border-radius:50%;display:grid;place-items:center;position:relative}
.metric-ring:before{content:"";position:absolute;inset:13px;border-radius:50%;background:var(--panel)}
.metric-ring div{position:relative;text-align:center}
.metric-ring strong{font-size:28px;display:block}
.metric-ring span{font-size:9px;text-transform:uppercase;letter-spacing:1.2px;opacity:.6}
.bars{height:92px;display:flex;align-items:flex-end;gap:7px;padding-top:8px}
.bars i{display:block;flex:1;background:var(--accent)}
.note{font-size:11px;line-height:1.55;opacity:.72}
.spark{height:70px;margin-top:8px}
.spark svg{width:100%;height:100%}
`;

const graphSvg = (kind) => {
  if (kind === 'orphism') return `
  <svg viewBox="0 0 690 330">
    <g fill="none" stroke="currentColor" stroke-opacity=".16">
      <circle cx="330" cy="165" r="132"/><circle cx="330" cy="165" r="98"/><circle cx="330" cy="165" r="64"/>
    </g>
    <g class="orb-lines" fill="none" stroke-width="2">
      <path d="M330 165 C270 90 160 92 92 168"/><path d="M330 165 C420 78 534 104 605 58"/>
      <path d="M330 165 C416 212 526 238 627 198"/><path d="M330 165 C260 246 180 277 92 236"/>
    </g>
    <g class="orb">
      <circle cx="330" cy="165" r="42"/><circle cx="170" cy="102" r="26"/><circle cx="532" cy="112" r="31"/>
      <circle cx="564" cy="241" r="22"/><circle cx="160" cy="250" r="34"/><circle cx="87" cy="168" r="17"/>
    </g>
    <g font-family="Arial" font-size="10">
      <text x="313" y="169">CASE 41</text><text x="145" y="106">Aster</text><text x="508" y="116">Meridian</text>
      <text x="540" y="245">Signal</text><text x="137" y="254">Harbor</text>
    </g>
  </svg>`;
  if (kind === 'vorticism') return `
  <svg viewBox="0 0 690 330">
    <g class="vortex" stroke="currentColor" stroke-width="2" fill="none">
      <path d="M75 44 L314 154 L118 92 L357 169 L145 270 L335 183 L612 277 L373 176 L624 62 L361 162 L465 28 L345 154"/>
      <path d="M222 23 L326 149 L270 34 L341 155 L529 76 L367 164 L580 198 L370 174 L447 308 L352 187 L250 302 L338 183"/>
    </g>
    <g class="vblocks">
      <path d="M302 135 L374 148 L391 188 L328 209 L286 174 Z"/>
      <path d="M95 64 L167 75 L145 112 L78 101 Z"/><path d="M532 226 L610 244 L590 287 L518 265 Z"/>
    </g>
    <g font-family="Arial" font-weight="700" font-size="10"><text x="313" y="174">CORE</text><text x="92" y="91">ENTITY 08</text><text x="536" y="260">RISK 0.92</text></g>
  </svg>`;
  if (kind === 'precisionism') return `
  <svg viewBox="0 0 690 330">
    <g class="factory">
      <rect x="70" y="188" width="128" height="86"/><rect x="208" y="145" width="88" height="129"/>
      <rect x="307" y="110" width="144" height="164"/><rect x="462" y="165" width="148" height="109"/>
      <rect x="103" y="82" width="24" height="106"/><rect x="337" y="52" width="27" height="58"/>
    </g>
    <g class="factory-lines" fill="none">
      <path d="M45 274 H645"/><path d="M70 188 L198 188 L242 145 L296 145 L348 110 L451 110 L504 165 L610 165"/>
      <path d="M322 139 H435 M322 169 H435 M322 199 H435 M322 229 H435"/>
    </g>
    <g font-family="Arial" font-size="9"><text x="72" y="295">INDUSTRIAL EXPOSURE / OWNERSHIP CORRIDOR / VERIFIED 07:40 UTC</text></g>
  </svg>`;
  if (kind === 'abstract_expressionism') return `
  <svg viewBox="0 0 690 330">
    <g class="gestures" fill="none" stroke-linecap="round">
      <path d="M42 242 C144 140 201 252 281 146 S431 89 514 162 S600 235 652 98"/>
      <path d="M55 108 C129 183 202 60 271 117 S376 252 454 181 S552 70 630 142"/>
      <path d="M139 45 C162 126 131 173 203 282"/><path d="M430 31 C387 110 479 160 429 294"/>
    </g>
    <g class="inknodes"><circle cx="281" cy="146" r="15"/><circle cx="454" cy="181" r="11"/><circle cx="203" cy="246" r="9"/><circle cx="552" cy="105" r="13"/></g>
    <g font-family="Arial" font-size="9"><text x="295" y="143">CHAIN A</text><text x="469" y="178">SIGNAL</text><text x="566" y="102">0.92</text></g>
  </svg>`;
  if (kind === 'minimalism_art') return `
  <svg viewBox="0 0 690 330">
    <g class="modules">
      ${Array.from({length: 7}, (_, i) => `<rect x="${74 + i * 82}" y="${114 + (i % 2) * 14}" width="56" height="82"/>`).join('')}
    </g>
    <g font-family="Arial" font-size="9" opacity=".65">
      ${Array.from({length: 7}, (_, i) => `<text x="${84 + i * 82}" y="${222 + (i % 2) * 14}">E${String(i+1).padStart(2,'0')}</text>`).join('')}
    </g>
    <path class="module-axis" d="M56 260 H635"/>
  </svg>`;
  if (kind === 'mexican_muralism') return `
  <svg viewBox="0 0 690 330">
    <path class="mural-band a" d="M0 230 Q95 174 180 212 T350 198 T520 216 T690 184 V330 H0Z"/>
    <path class="mural-band b" d="M0 265 Q105 209 211 248 T414 232 T690 224 V330 H0Z"/>
    <g class="figures">
      <circle cx="120" cy="139" r="24"/><path d="M89 224 Q120 151 151 224 Z"/>
      <circle cx="233" cy="124" r="26"/><path d="M194 218 Q233 141 271 218 Z"/>
      <circle cx="350" cy="144" r="22"/><path d="M319 227 Q350 159 382 227 Z"/>
      <circle cx="466" cy="118" r="28"/><path d="M425 221 Q466 137 507 221 Z"/>
      <circle cx="580" cy="146" r="21"/><path d="M550 226 Q580 160 611 226 Z"/>
    </g>
    <g class="mural-links" fill="none" stroke-width="4"><path d="M120 139 Q237 66 350 144 Q468 51 580 146"/></g>
  </svg>`;
  return `
  <svg viewBox="0 0 690 330">
    <g class="g-lines" stroke-width="2" fill="none">
      <path d="M88 205 L186 92 L310 142 L420 76 L590 160"/>
      <path d="M186 92 L244 244 L310 142 L382 237 L590 160"/>
      <path d="M88 205 L244 244 M420 76 L382 237"/>
    </g>
    <g class="g-nodes">
      <circle cx="88" cy="205" r="23"/><circle cx="186" cy="92" r="29"/><circle cx="244" cy="244" r="21"/>
      <circle cx="310" cy="142" r="38"/><circle cx="420" cy="76" r="25"/><circle cx="382" cy="237" r="27"/><circle cx="590" cy="160" r="32"/>
    </g>
    <g font-family="Arial" font-size="9">
      <text x="72" y="209">SOURCE</text><text x="168" y="96">ASTER</text><text x="226" y="248">DOC 19</text>
      <text x="287" y="146">CASE 41</text><text x="402" y="80">OWNER</text><text x="361" y="241">SIGNAL</text><text x="570" y="164">DELTA</text>
    </g>
  </svg>`;
};

function styleCss(slug) {
  const map = {
    fauvism: `
      :root{--bg:#f4e8cf;--panel:#fff7e7;--ink:#182338;--line:#182338;--accent:#e33b25}
      .rail{background:#173d61;color:#fff;border:0}.brand-mark{background:#f3c525}.nav.active{background:#ea4438;border-color:#ea4438}
      .topbar:after{content:"";position:absolute;right:0;top:0;width:210px;height:22px;background:#f2c624}
      .kpi:nth-child(1){background:#e74935;color:white}.kpi:nth-child(2){background:#f1c72f}.kpi:nth-child(3){background:#2f9b78;color:white}.kpi:nth-child(4){background:#d95e91}
      .card{border-width:2px}.g-lines{stroke:#132d47}.g-nodes circle:nth-child(odd){fill:#f0bf26;stroke:#173d61;stroke-width:4}.g-nodes circle:nth-child(even){fill:#e84e39;stroke:#173d61;stroke-width:4}
      .metric-ring{background:conic-gradient(#e84935 0 69%,#f0c72f 69% 84%,#2f9b78 84%)} .bars i:nth-child(3n){background:#e84935}.bars i:nth-child(3n+2){background:#f0c72f}
      .lower>.card:last-child{background:#2f9b78;color:white}.right>.card:nth-child(2){background:#f1c72f}.right>.card:nth-child(3){background:#fff2dc}
    `,
    orphism: `
      :root{--bg:#14172b;--panel:#f7f2e8;--ink:#202039;--line:#c9c1b7;--accent:#eb3f64}
      .rail{background:#101326;color:#f8f3e8;border-color:#353852}.brand-mark{border-radius:50%;background:#30c6b0;box-shadow:7px 0 0 #ed4567,-7px 0 0 #f5bf36}
      .nav.active{background:#262b4b;border-radius:24px}.main{background:#f1eadf}
      .card{border-radius:22px}.kpi{border-radius:60px 16px 60px 16px;padding:20px}
      .kpi:nth-child(1){background:#f2b933}.kpi:nth-child(2){background:#ef5272}.kpi:nth-child(3){background:#3abaae}.kpi:nth-child(4){background:#7a66ce;color:white}
      .orb-lines{stroke:#473b83}.orb circle:nth-child(1){fill:#ef5272;fill-opacity:.73}.orb circle:nth-child(2){fill:#f0b933;fill-opacity:.78}.orb circle:nth-child(3){fill:#43c3b2;fill-opacity:.74}.orb circle:nth-child(4){fill:#6d60cc;fill-opacity:.78}.orb circle:nth-child(5){fill:#ef5272;fill-opacity:.6}.orb circle:nth-child(6){fill:#f4bd37}
      .metric-ring{background:conic-gradient(#ef5272 0 31%,#f1bc39 31% 53%,#3bbfb1 53% 76%,#7362ca 76%)}
      .bars i{border-radius:12px 12px 0 0}.bars i:nth-child(2n){background:#3bbfb1}.bars i:nth-child(3n){background:#f0b936}
    `,
    vorticism: `
      :root{--bg:#e8e6de;--panel:#f6f4ed;--ink:#0e0f0f;--line:#151515;--accent:#d7ed1b}
      .app{grid-template-columns:190px 1fr}.rail{background:#0b0b0b;color:#fff;border:0;padding-left:18px}.brand{transform:skewY(-6deg)}.brand-mark{background:#d7ed1b;clip-path:polygon(0 0,100% 18%,74% 100%,13% 72%)}
      .nav{clip-path:polygon(0 0,94% 0,100% 50%,94% 100%,0 100%)}.nav.active{background:#d7ed1b;color:#000}
      h1{text-transform:uppercase;font-weight:900;font-size:38px}.card{border:2px solid #111;box-shadow:5px 5px 0 #111}
      .kpis{gap:8px}.kpi{background:#eeeae0;border:2px solid #111;clip-path:polygon(0 0,100% 0,94% 100%,6% 100%)}.kpi:nth-child(2){background:#111;color:#fff}.kpi:nth-child(3){background:#d7ed1b}
      .vortex{stroke:#111}.vblocks path{fill:#111}.vblocks path:nth-child(2){fill:#d7ed1b}.metric-ring{background:conic-gradient(#111 0 78%,#d7ed1b 78%)}
      .bars i{background:#111}.bars i:nth-child(6){background:#d7ed1b}.pill{border:2px solid #111}
    `,
    precisionism: `
      :root{--bg:#d9e0e1;--panel:#eef2f0;--ink:#273238;--line:#9eabad;--accent:#b94c39}
      .app{grid-template-columns:208px 1fr}.rail{background:#cfd7d8}.brand-mark{width:10px;height:28px;background:#3b535b}.nav.active{background:#364b52;color:white}
      .main{padding:34px 38px}.workspace{gap:24px}.center,.right{gap:24px}.lower{gap:24px}.card{border:0;box-shadow:inset 0 0 0 1px #a8b2b4}
      h1{font-weight:400;letter-spacing:-1px}.kpis{gap:18px}.kpi{border:0;background:#e6ebea;border-top:5px solid #52676c}.kpi:nth-child(4){border-top-color:#b94c39}
      .factory{fill:#697d81}.factory rect:nth-child(3){fill:#415a60}.factory-lines{stroke:#7d8e91;stroke-width:2}.metric-ring{background:conic-gradient(#526b71 0 76%,#b94c39 76%)}
      .bars i{background:#657a7f}.e-row strong{color:#9f4536}
    `,
    abstract_expressionism: `
      :root{--bg:#d8d0c2;--panel:#eee8dd;--ink:#26211c;--line:#b6ab9b;--accent:#9f402f}
      body{background:#cfc7b9}.rail{background:#2c2925;color:#eee8dd;border:0}.brand-mark{background:#9f402f;transform:rotate(-8deg)}.nav.active{border-left:5px solid #b2523f;background:#39342e}
      .main:before{content:"";position:absolute;width:270px;height:70px;left:390px;top:8px;border-top:7px solid rgba(50,43,37,.18);transform:rotate(-3deg)}
      .card{border-color:#9c9183;border-radius:2px}.kpi{background:#e7e0d3}.kpi:nth-child(2){transform:translateY(8px)}.kpi:nth-child(4){transform:translateY(-5px)}
      .gestures path:nth-child(1){stroke:#332d28;stroke-width:13}.gestures path:nth-child(2){stroke:#a04634;stroke-width:8}.gestures path:nth-child(3){stroke:#6f665b;stroke-width:5}.gestures path:nth-child(4){stroke:#2b2a28;stroke-width:3}
      .inknodes circle{fill:#26221e}.inknodes circle:nth-child(2){fill:#a04634}.metric-ring{background:conic-gradient(#302a26 0 65%,#a24634 65% 82%,#8c8174 82%)}
      .bars i{background:#39322c}.bars i:nth-child(2),.bars i:nth-child(7){background:#a04634}.graph-card:after{content:"";position:absolute;width:170px;height:8px;background:#9f402f;right:-25px;bottom:28px;transform:rotate(-6deg);opacity:.55}
    `,
    color_field: `
      :root{--bg:#b95d53;--panel:#d8a66b;--ink:#251f24;--line:rgba(37,31,36,.2);--accent:#532f52}
      .rail{background:#5a3558;color:#f2d8bf;border:0}.brand-mark{background:#e0a368}.nav.active{background:#c56457;color:#241d22;border:0}
      .main{background:#c96a5d;padding:32px}.card{border:0;border-radius:14px}.kpis{gap:14px}.kpi{border:0;border-radius:12px}
      .kpi:nth-child(1){background:#e4ae70}.kpi:nth-child(2){background:#a84f50;color:#f8dfc3}.kpi:nth-child(3){background:#654161;color:#f7dfc4}.kpi:nth-child(4){background:#d78967}
      .center>.card:first-child{background:#d5966d}.graph-card{background:#e2b174}.lower>.card:last-child{background:#77495f;color:#f4dabb}
      .right>.card:nth-child(1){background:#5f3a5a;color:#f5dabc}.right>.card:nth-child(2){background:#dba170}.right>.card:nth-child(3){background:#9b5358;color:#f5dcc4}
      .g-lines{stroke:#77465c;stroke-opacity:.55}.g-nodes circle{fill:#c96a5d;stroke:#673b57;stroke-width:2}.metric-ring{background:conic-gradient(#e0aa70 0 72%,#bf6256 72% 88%,#835067 88%)}
      .bars i{background:#5e3b58}.e-row{border-color:rgba(255,255,255,.18)}
    `,
    hard_edge: `
      :root{--bg:#f0eadb;--panel:#f8f4e9;--ink:#191b26;--line:#191b26;--accent:#ed603a}
      .app:before{content:"";position:absolute;left:220px;top:0;width:22px;height:100%;background:#f0bf28;z-index:1}.rail{background:#20243d;color:#fff;border:0}
      .brand-mark{background:#ef5b38}.nav.active{background:#ef5b38}.card{border:0}.main{padding-left:44px}
      .topbar{border-bottom:12px solid #20243d}.kpis{gap:0}.kpi{border:0;border-right:8px solid #f8f4e9}
      .kpi:nth-child(1){background:#f0bd27}.kpi:nth-child(2){background:#ef603d}.kpi:nth-child(3){background:#295e61;color:#fff}.kpi:nth-child(4){background:#252a49;color:#fff}
      .graph-card{clip-path:polygon(0 0,100% 0,100% 85%,91% 100%,0 100%);background:#f3c32f}
      .g-lines{stroke:#20243d}.g-nodes circle{fill:#f8f4e9;stroke:#20243d;stroke-width:4}.g-nodes circle:nth-child(4){fill:#ed603a}
      .lower>.card:last-child{background:#295e61;color:white}.right>.card:nth-child(1){background:#252a49;color:#fff}.right>.card:nth-child(2){background:#ef603d}.right>.card:nth-child(3){background:#efeee4;border-right:30px solid #f0bd27}
      .metric-ring{border-radius:0;clip-path:polygon(50% 0,100% 25%,80% 100%,16% 90%,0 28%);background:#f0bd27}.metric-ring:before{border-radius:0;clip-path:inherit;background:#252a49}
    `,
    op_art: `
      :root{--bg:#f2f2ef;--panel:#fafaf7;--ink:#111;--line:#b8b8b2;--accent:#111}
      body:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(90deg,rgba(0,0,0,.035) 0 1px,transparent 1px 13px);pointer-events:none}
      .rail{background:#111;color:#fff;border:0}.brand-mark{background:repeating-linear-gradient(90deg,#fff 0 2px,#111 2px 4px);border:1px solid #fff}
      .nav.active{background:#fff;color:#111}.card{background:#f7f7f3}.kpi{background:#fff}.kpi:nth-child(odd){background:repeating-linear-gradient(135deg,#fff 0 7px,#ecece7 7px 14px)}
      .graph{background:radial-gradient(circle at 50% 50%,transparent 0 24px,#111 25px 27px,transparent 28px 52px,#111 53px 55px,transparent 56px 82px,#111 83px 85px,transparent 86px);background-size:100% 100%}
      .g-lines{stroke:#111;stroke-dasharray:3 5}.g-nodes circle{fill:#fff;stroke:#111;stroke-width:3}.g-nodes circle:nth-child(4){fill:#111}
      .metric-ring{background:repeating-conic-gradient(#111 0deg 7deg,#f7f7f3 7deg 14deg)}.metric-ring:before{inset:23px}
      .bars i{background:repeating-linear-gradient(90deg,#111 0 3px,#fff 3px 6px);border:1px solid #111}
      .right>.card:nth-child(3):after{content:"";position:absolute;right:-18px;bottom:-16px;width:128px;height:128px;border-radius:50%;background:repeating-radial-gradient(circle,#111 0 2px,transparent 2px 8px);opacity:.14}
    `,
    minimalism_art: `
      :root{--bg:#e7e5df;--panel:#efeee9;--ink:#2c2c29;--line:#bdbbb4;--accent:#696964}
      .app{grid-template-columns:176px 1fr}.rail{background:#deddd7;padding:34px 20px}.brand b{font-size:10px}.brand-mark{width:16px;height:16px;background:#5e5e59}.nav{height:52px;padding:0;border-bottom:1px solid #b8b6af}.nav.active{background:transparent;border:1px solid #555}
      .main{padding:38px 46px}.workspace{gap:28px}.center,.right,.lower{gap:28px}.card{background:#efeee9}.kpis{gap:18px}.kpi{background:#e1e0db;min-height:128px}.kpi strong{font-weight:400}
      .modules rect{fill:#8c8c86}.modules rect:nth-child(even){fill:#6f6f69}.module-axis{stroke:#4e4e4a;stroke-width:1}
      .metric-ring{background:#7c7c76}.metric-ring:before{background:#efeee9}.bars{gap:12px}.bars i{background:#777772}
      h1{font-weight:400;font-size:31px}.pill{background:#e3e2dc}
    `,
    mexican_muralism: `
      :root{--bg:#d8c5a3;--panel:#ead9b7;--ink:#382f27;--line:#80684f;--accent:#a3452f}
      .rail{background:#49392e;color:#f0d9af;border:0}.brand-mark{background:#c78b38;border-radius:50% 50% 8px 8px}.nav.active{background:#9c462f}
      .main{background:#d6bf96}.topbar{border-bottom:4px solid #594332;padding-bottom:14px}.card{border:2px solid #735a43}
      .kpi{background:#e9d3a9;border:2px solid #72583f}.kpi:nth-child(2){background:#ac5a3d;color:#f2dfb7}.kpi:nth-child(3){background:#61705a;color:#f2dfb7}.kpi:nth-child(4){background:#c88a3d}
      .graph-card{background:#dfc99c}.mural-band.a{fill:#ab5a3d}.mural-band.b{fill:#626d56}.figures{fill:#d8a34b;stroke:#49382d;stroke-width:4}.figures path:nth-of-type(2n){fill:#9c4935}.mural-links{stroke:#49382d}
      .lower>.card:last-child{background:#c88d45}.right>.card:nth-child(1){background:#65705a;color:#f3dfba}.right>.card:nth-child(2){background:#e2bd72}.right>.card:nth-child(3){background:#a7503a;color:#f4dfbb}
      .metric-ring{background:conic-gradient(#d6a247 0 58%,#a85039 58% 82%,#4f654e 82%)}
      .bars i{background:#47382d}.bars i:nth-child(2n){background:#a64c37}
      .e-row{border-color:rgba(61,46,35,.35)}
    `
  };
  return map[slug];
}

function htmlFor(style) {
  const graphKind = ['orphism','vorticism','precisionism','abstract_expressionism','minimalism_art','mexican_muralism'].includes(style.slug) ? style.slug : 'default';

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${style.name}</title>
<style>${baseCss}${styleCss(style.slug)}</style>
</head>
<body>
<div class="app">
  <aside class="rail">${nav}</aside>
  <main class="main">
    <header class="topbar">
      <div>
        <div class="eyebrow">Risk intelligence / evidence relationship observatory</div>
        <h1>Case Network 41</h1>
      </div>
      <div class="meta">
        <div class="pill">Updated 07:40 UTC</div>
        <div class="pill live">Monitoring live</div>
      </div>
    </header>

    <section class="workspace">
      <div class="center">
        <section class="card card-pad">
          <div class="card-title"><b>Operational signal summary</b><span>Last 24 hours</span></div>
          <div class="kpis">
            <div class="kpi"><small>High risk entities</small><strong>18</strong><em>+4 since prior scan</em></div>
            <div class="kpi"><small>Evidence links</small><strong>246</strong><em>31 newly verified</em></div>
            <div class="kpi"><small>Network density</small><strong>0.67</strong><em>Cross-case concentration</em></div>
            <div class="kpi"><small>Priority score</small><strong>92</strong><em>Escalation recommended</em></div>
          </div>
        </section>

        <div class="lower">
          <section class="card graph-card card-pad">
            <div class="card-title"><b>Relationship field</b><span>Verified evidence only</span></div>
            <div class="graph">${graphSvg(graphKind)}</div>
          </section>

          <section class="card card-pad">
            <div class="card-title"><b>Priority evidence</b><span>Confidence</span></div>
            <div class="list">${evidenceRows}</div>
            <div class="spark">${svgSpark()}</div>
          </section>
        </div>
      </div>

      <aside class="right">
        <section class="card card-pad">
          <div class="card-title"><b>Composite exposure</b><span>Weighted index</span></div>
          <div class="metric-ring"><div><strong>76</strong><span>Elevated</span></div></div>
          <div class="note">Ownership opacity and supplier concentration remain the primary drivers of current case exposure.</div>
        </section>

        <section class="card card-pad">
          <div class="card-title"><b>Signal volume</b><span>9 intervals</span></div>
          ${bars}
          <div class="note">Peak cluster: affiliated transfer records / 06:20-07:10 UTC.</div>
        </section>

        <section class="card card-pad">
          <div class="card-title"><b>Analyst queue</b><span>4 open</span></div>
          <div class="list">
            <div class="e-row"><b>Validate owner chain</b><span>Aster Holdings</span><strong>H</strong></div>
            <div class="e-row"><b>Compare filings</b><span>Northbridge</span><strong>H</strong></div>
            <div class="e-row"><b>Review invoices</b><span>Meridian Works</span><strong>M</strong></div>
          </div>
          <div class="note" style="margin-top:14px">Next model refresh follows completion of two high-priority verification tasks.</div>
        </section>
      </aside>
    </section>
  </main>
</div>
</body>
</html>`;
}

(async () => {
  const launchOptions = {
    headless: true,
    args: ['--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1']
  };
  if (fs.existsSync(EDGE)) launchOptions.executablePath = EDGE;

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1536, height: 1024 },
    screen: { width: 1536, height: 1024 },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();

  await page.route('**/*', route => {
    const url = route.request().url();
    if (/^https?:/i.test(url)) return route.abort();
    return route.continue();
  });

  for (const style of styles) {
    const outDir = path.join(
      ROOT,
      'design_style_library',
      'styles',
      style.slug,
      'previews'
    );
    fs.mkdirSync(outDir, { recursive: true });

    await page.setContent(htmlFor(style), {
      waitUntil: 'load'
    });

    await page.evaluate(() => {
      document.documentElement.style.width = '1536px';
      document.documentElement.style.height = '1024px';
      document.body.style.width = '1536px';
      document.body.style.height = '1024px';
    });

    await page.screenshot({
      path: path.join(outDir, 'medium_chatgpt_rendered.png'),
      type: 'png',
      fullPage: false,
      animations: 'disabled',
      caret: 'hide'
    });
  }

  await context.close();
  await browser.close();
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
