const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const STYLES_ROOT = path.join(ROOT, 'design_style_library', 'styles');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const configs = {
  abstract_expressionism: { bg: '#cfc6b6', panel: '#eee7dc', ink: '#29241f', accent: '#a64734', aux: '#6e665a', form: 'gesture' },
  art_deco: { bg: '#11151d', panel: '#f1e2bf', ink: '#18130d', accent: '#c79a38', aux: '#253241', form: 'deco' },
  art_nouveau: { bg: '#d7d1b6', panel: '#fbf4dd', ink: '#314131', accent: '#8a9b5d', aux: '#b07c4f', form: 'nouveau' },
  arts_and_crafts: { bg: '#384d35', panel: '#f2e7c8', ink: '#243321', accent: '#b99a46', aux: '#6f7b58', form: 'craft' },
  baroque: { bg: '#130f13', panel: '#291b20', ink: '#f7ead0', accent: '#c99335', aux: '#76293b', form: 'baroque' },
  bauhaus: { bg: '#e8e2d2', panel: '#f7f2e7', ink: '#1c1d20', accent: '#d4332f', aux: '#22599b', form: 'bauhaus' },
  color_field: { bg: '#c7675a', panel: '#e2a46d', ink: '#1e1921', accent: '#6d3e64', aux: '#e8b76d', form: 'field' },
  constructivism: { bg: '#c8b89b', panel: '#f1eadc', ink: '#171717', accent: '#bc2f28', aux: '#222222', form: 'constructivism' },
  cubism: { bg: '#928572', panel: '#d8cfbf', ink: '#2d2924', accent: '#72583d', aux: '#697881', form: 'cubism' },
  dada: { bg: '#c6bca7', panel: '#eee8dc', ink: '#161616', accent: '#b72e28', aux: '#2b5a7b', form: 'dada' },
  de_stijl: { bg: '#f4f1e8', panel: '#ffffff', ink: '#111111', accent: '#d4312a', aux: '#245d9b', form: 'destijl' },
  expressionism: { bg: '#26162d', panel: '#e4bc32', ink: '#241327', accent: '#dd3e32', aux: '#2d7690', form: 'expressionism' },
  fauvism: { bg: '#1f4c74', panel: '#f4e8cc', ink: '#101b2e', accent: '#ef4438', aux: '#35a278', form: 'fauvism' },
  futurism: { bg: '#11171d', panel: '#e9e2d3', ink: '#171d23', accent: '#ee4a2f', aux: '#2e7186', form: 'futurism' },
  hard_edge: { bg: '#1f243e', panel: '#f2ead9', ink: '#0f1324', accent: '#f4c51e', aux: '#286769', form: 'hardedge' },
  impressionism: { bg: '#b8d6d1', panel: '#fbf3d5', ink: '#324b4f', accent: '#e28162', aux: '#7698bb', form: 'impressionism' },
  mexican_muralism: { bg: '#4a382c', panel: '#dec697', ink: '#2f241c', accent: '#aa4d34', aux: '#67775a', form: 'mural' },
  minimalism_art: { bg: '#deded8', panel: '#f0efeb', ink: '#222521', accent: '#73746c', aux: '#a6a49b', form: 'minimal' },
  neoclassicism: { bg: '#c7c4ba', panel: '#f2f0e8', ink: '#272a31', accent: '#8f3034', aux: '#9a8d71', form: 'classical' },
  op_art: { bg: '#efefed', panel: '#f9f9f7', ink: '#111111', accent: '#111111', aux: '#7d7d77', form: 'opart' },
  orphism: { bg: '#111429', panel: '#f3ecde', ink: '#11142b', accent: '#ef4e78', aux: '#3fc0b6', form: 'orphism' },
  pop_art: { bg: '#f2ca25', panel: '#fff7df', ink: '#111111', accent: '#e43b33', aux: '#235aa6', form: 'pop' },
  post_impressionism: { bg: '#244f65', panel: '#f2c94a', ink: '#182f39', accent: '#d94f3d', aux: '#4f7d4a', form: 'postimpressionism' },
  precisionism: { bg: '#d7e0e1', panel: '#eef2f0', ink: '#263338', accent: '#b94c39', aux: '#60777d', form: 'precisionism' },
  renaissance: { bg: '#d5c1a2', panel: '#f8efdc', ink: '#2d251e', accent: '#9d3d2e', aux: '#71826d', form: 'renaissance' },
  rococo: { bg: '#dadce9', panel: '#fff8f0', ink: '#485267', accent: '#c9899e', aux: '#89a79b', form: 'rococo' },
  romanticism: { bg: '#182533', panel: '#293744', ink: '#f0e6d1', accent: '#dc7b45', aux: '#6e8ba0', form: 'romanticism' },
  suprematism: { bg: '#e9e7df', panel: '#fbfaf6', ink: '#161616', accent: '#d83b2f', aux: '#245b9b', form: 'suprematism' },
  surrealism: { bg: '#d2c6ad', panel: '#f2ead8', ink: '#2a2520', accent: '#7861a6', aux: '#4d7b7d', form: 'surrealism' },
  symbolism: { bg: '#151126', panel: '#211733', ink: '#f3eadb', accent: '#d5b56e', aux: '#78a0b6', form: 'symbolism' },
  ukiyo_e: { bg: '#c9d5cc', panel: '#f7ecd2', ink: '#24354c', accent: '#2d5f93', aux: '#d08a4c', form: 'ukiyoe' },
  vorticism: { bg: '#0e0e0d', panel: '#f2efe7', ink: '#111111', accent: '#d8f20e', aux: '#222222', form: 'vorticism' },
};

function readStyle(slug) {
  const file = path.join(STYLES_ROOT, slug, 'style.json');
  const data = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(data);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function lineChart(color, color2) {
  return `<svg viewBox="0 0 560 160" preserveAspectRatio="none"><path d="M0 122 C46 103 72 136 112 96 S183 58 226 91 S302 126 349 72 S441 88 486 43 S534 68 560 26" fill="none" stroke="${color}" stroke-width="5"/><path d="M0 138 C58 130 83 107 132 114 S218 80 278 96 S372 58 424 68 S505 39 560 48" fill="none" stroke="${color2}" stroke-width="3" opacity=".7"/></svg>`;
}

function motif(form, c) {
  const a = c.accent, b = c.aux, ink = c.ink, panel = c.panel;
  const base = {
    deco: `<path d="M90 420 L300 80 L510 420 Z" fill="none" stroke="${a}" stroke-width="18"/><path d="M170 420 L300 205 L430 420" fill="none" stroke="${a}" stroke-width="10"/><path d="M300 88 V420 M220 220 H380 M185 300 H415" stroke="${ink}" stroke-width="3"/>`,
    nouveau: `<path d="M86 422 C250 220 142 92 312 154 C462 209 347 387 536 239" fill="none" stroke="${a}" stroke-width="13"/><path d="M153 330 C154 223 216 167 299 166 C252 226 231 290 153 330Z" fill="${b}" opacity=".7"/><path d="M371 237 C456 246 504 303 512 389 C445 349 397 307 371 237Z" fill="${a}" opacity=".55"/>`,
    craft: `<rect x="120" y="120" width="360" height="280" fill="none" stroke="${a}" stroke-width="8"/><path d="M300 380 C295 310 298 240 300 160 M300 270 C250 238 230 205 222 160 M303 283 C356 250 381 207 392 164" stroke="${b}" stroke-width="8" fill="none"/><path d="M220 160 C268 151 289 174 300 204 C246 206 222 188 220 160Z M392 164 C344 151 316 177 304 207 C361 205 389 188 392 164Z" fill="${b}"/>`,
    baroque: `<path d="M64 360 C130 126 288 475 356 132 C391 -45 592 165 468 358 C392 475 230 265 143 438" fill="none" stroke="${a}" stroke-width="18"/><path d="M94 392 C190 327 233 215 271 92" stroke="${b}" stroke-width="10"/><circle cx="366" cy="210" r="82" fill="${a}" opacity=".24"/>`,
    bauhaus: `<circle cx="204" cy="236" r="104" fill="${a}"/><rect x="306" y="132" width="170" height="170" fill="${b}"/><path d="M136 386 L534 92" stroke="${ink}" stroke-width="12"/><circle cx="439" cy="375" r="54" fill="${panel}" stroke="${ink}" stroke-width="8"/>`,
    constructivism: `<path d="M40 388 L554 115" stroke="${a}" stroke-width="42"/><path d="M82 104 L528 420" stroke="${ink}" stroke-width="10"/><path d="M92 284 L464 236" stroke="${ink}" stroke-width="6"/><rect x="182" y="156" width="222" height="116" fill="${panel}" stroke="${ink}" stroke-width="8" transform="rotate(-17 293 214)"/>`,
    cubism: `<path d="M88 374 L160 124 L320 168 L504 94 L448 390 L244 430 Z" fill="${a}" opacity=".42"/><path d="M160 124 L244 430 M320 168 L244 430 M504 94 L320 168 M88 374 L320 168" stroke="${ink}" stroke-width="6"/><path d="M122 278 L274 205 L388 326 L214 382Z" fill="${b}" opacity=".5"/>`,
    dada: `<rect x="116" y="128" width="265" height="96" fill="${a}" transform="rotate(-7 248 176)"/><rect x="243" y="249" width="260" height="92" fill="${ink}" transform="rotate(9 373 295)"/><path d="M84 392 L532 92" stroke="${b}" stroke-width="12"/><text x="150" y="204" font-size="54" font-family="Impact,Arial" fill="${panel}">DATA</text>`,
    destijl: `<rect x="70" y="70" width="490" height="390" fill="#fff"/><path d="M70 184 H560 M228 70 V460 M428 70 V460 M70 334 H428" stroke="#111" stroke-width="18"/><rect x="70" y="70" width="158" height="114" fill="${a}"/><rect x="428" y="184" width="132" height="150" fill="${b}"/><rect x="228" y="334" width="200" height="126" fill="#f4c51e"/>`,
    expressionism: `<path d="M72 340 C134 87 251 465 342 158 C386 13 505 220 474 392" fill="none" stroke="${ink}" stroke-width="18"/><path d="M82 216 C216 123 291 322 506 139" stroke="${a}" stroke-width="16" fill="none"/><path d="M126 414 L496 366 L438 444 L174 470Z" fill="${b}" opacity=".75"/>`,
    gesture: `<path d="M76 360 C132 156 268 412 338 196 C398 12 498 226 452 430" fill="none" stroke="${ink}" stroke-width="19" stroke-linecap="round"/><path d="M64 232 C166 292 236 132 342 250 S482 350 548 176" fill="none" stroke="${a}" stroke-width="13" stroke-linecap="round"/><path d="M118 410 C224 356 322 438 510 354" fill="none" stroke="${b}" stroke-width="8" opacity=".75"/><g fill="${ink}" opacity=".9"><circle cx="214" cy="340" r="14"/><circle cx="470" cy="235" r="16"/></g>`,
    fauvism: `<circle cx="238" cy="238" r="92" fill="${a}"/><circle cx="386" cy="220" r="70" fill="#f4ca28"/><circle cx="314" cy="354" r="78" fill="${b}"/><path d="M82 148 C189 106 226 389 520 148" stroke="${ink}" stroke-width="10" fill="none"/><path d="M94 426 C210 346 350 488 520 370" stroke="${a}" stroke-width="30" fill="none"/>`,
    futurism: `<path d="M82 408 L536 82" stroke="${a}" stroke-width="22"/><path d="M74 316 L536 162 M104 214 L486 420 M210 82 L390 440" stroke="${ink}" stroke-width="8"/><path d="M116 390 C230 282 318 196 520 106" fill="none" stroke="${b}" stroke-width="16"/>`,
    hardedge: `<polygon points="66,120 350,120 270,452 66,452" fill="${a}"/><polygon points="350,120 548,120 548,452 270,452" fill="${b}"/><polygon points="210,192 430,192 342,368 134,368" fill="${panel}"/>`,
    impressionism: `<path d="M72 330 C160 262 197 353 286 274 S420 216 526 300" stroke="${a}" stroke-width="18" fill="none" opacity=".75"/><path d="M96 216 C178 178 263 230 336 184 S442 154 504 198" stroke="${b}" stroke-width="14" fill="none" opacity=".65"/><g fill="${ink}" opacity=".22">${Array.from({length:42},(_,i)=>`<circle cx="${80+(i%7)*70}" cy="${150+Math.floor(i/7)*48}" r="${5+(i%4)*2}"/>`).join('')}</g>`,
    mural: `<path d="M70 384 C156 296 218 420 316 338 S430 300 535 374 L535 444 L70 444Z" fill="${b}"/><path d="M70 360 C180 300 242 384 334 306 S468 282 535 342" fill="none" stroke="${a}" stroke-width="32"/><g stroke="${ink}" stroke-width="7" fill="${panel}"><circle cx="154" cy="280" r="28"/><circle cx="276" cy="252" r="34"/><circle cx="408" cy="278" r="30"/></g>`,
    minimal: `<g fill="${a}">${[0,1,2,3,4,5,6].map(i=>`<rect x="${132+i*54}" y="${230+(i%2)*28}" width="38" height="118"/>`).join('')}</g><path d="M96 410 H520" stroke="${ink}" stroke-width="2"/><circle cx="496" cy="174" r="10" fill="${ink}" opacity=".4"/>`,
    classical: `<path d="M110 400 H510 M150 352 H470 M180 160 H440 M204 160 V352 M286 160 V352 M368 160 V352" stroke="${ink}" stroke-width="13"/><path d="M156 160 L310 72 L464 160Z" fill="${panel}" stroke="${a}" stroke-width="10"/>`,
    opart: `<g fill="none" stroke="${ink}" stroke-width="6">${Array.from({length:16},(_,i)=>`<circle cx="310" cy="260" r="${22+i*14}"/>`).join('')}</g><g fill="${ink}">${Array.from({length:28},(_,i)=>`<rect x="${64+i*18}" y="96" width="8" height="330" transform="rotate(${i%2?8:-8} ${68+i*18} 260)"/>`).join('')}</g>`,
    orphism: `<g opacity=".9">${[0,1,2,3,4].map(i=>`<circle cx="310" cy="260" r="${58+i*38}" fill="none" stroke="${[a,b,'#f5bf35','#7f63d2','#40c5b7'][i]}" stroke-width="30" opacity=".78"/>`).join('')}</g><path d="M98 344 C210 224 344 376 526 188" stroke="${ink}" stroke-width="4" fill="none"/>`,
    pop: `<rect x="78" y="118" width="430" height="280" rx="40" fill="${a}" stroke="${ink}" stroke-width="10"/><circle cx="430" cy="170" r="96" fill="${b}" stroke="${ink}" stroke-width="8"/><g fill="${ink}" opacity=".22">${Array.from({length:90},(_,i)=>`<circle cx="${96+(i%15)*28}" cy="${138+Math.floor(i/15)*38}" r="5"/>`).join('')}</g><text x="130" y="286" font-size="76" font-family="Impact,Arial" fill="${panel}" stroke="${ink}" stroke-width="2">RISK!</text>`,
    postimpressionism: `<path d="M76 320 C160 150 286 430 514 164" fill="none" stroke="${ink}" stroke-width="10"/><path d="M98 392 C198 330 258 438 338 356 S458 296 526 378" fill="none" stroke="${a}" stroke-width="18"/><circle cx="300" cy="252" r="86" fill="${b}" opacity=".62" stroke="${ink}" stroke-width="7"/>`,
    precisionism: `<path d="M100 420 H530 M150 420 V232 H248 V170 H356 V112 H468 V420" fill="${b}" opacity=".85"/><path d="M100 420 H530 M150 420 V232 H248 V170 H356 V112 H468 V420 M248 170 H468 M356 112 V420" stroke="${ink}" stroke-width="5"/>`,
    renaissance: `<path d="M86 420 L310 92 L534 420 M170 420 L310 214 L450 420" stroke="${a}" stroke-width="8" fill="none"/><path d="M310 92 V420 M100 420 H520 M176 300 H444" stroke="${ink}" stroke-width="3"/><circle cx="310" cy="242" r="86" fill="none" stroke="${b}" stroke-width="8"/>`,
    rococo: `<path d="M104 326 C184 100 327 456 430 184 C492 40 575 232 456 404" stroke="${a}" stroke-width="16" fill="none"/><path d="M142 376 C220 315 261 383 338 320 S456 254 520 322" stroke="${b}" stroke-width="12" fill="none"/><circle cx="276" cy="210" r="62" fill="${a}" opacity=".25"/>`,
    romanticism: `<path d="M62 420 C130 226 240 332 326 190 C410 52 494 204 548 82 L548 452 L62 452Z" fill="${b}" opacity=".62"/><path d="M82 392 C210 280 310 410 526 214" stroke="${a}" stroke-width="18" fill="none"/><circle cx="450" cy="118" r="48" fill="${a}" opacity=".75"/>`,
    suprematism: `<rect x="86" y="236" width="260" height="66" fill="${a}" transform="rotate(-18 216 269)"/><circle cx="426" cy="176" r="62" fill="${b}"/><rect x="360" y="324" width="150" height="46" fill="${ink}" transform="rotate(12 435 347)"/><path d="M104 420 L540 100" stroke="${ink}" stroke-width="3"/>`,
    surrealism: `<rect x="102" y="326" width="382" height="80" fill="${b}" opacity=".55"/><circle cx="276" cy="220" r="88" fill="${panel}" stroke="${ink}" stroke-width="7"/><circle cx="276" cy="220" r="28" fill="${a}"/><path d="M410 116 C526 200 526 320 418 400" stroke="${a}" stroke-width="12" fill="none"/><rect x="128" y="112" width="90" height="170" fill="${ink}" opacity=".28"/>`,
    symbolism: `<circle cx="310" cy="245" r="126" fill="none" stroke="${a}" stroke-width="9"/><circle cx="310" cy="245" r="72" fill="${b}" opacity=".55"/><path d="M116 350 C210 230 416 470 512 148" fill="none" stroke="${a}" stroke-width="5"/><g fill="${a}"><circle cx="152" cy="188" r="8"/><circle cx="450" cy="160" r="8"/><circle cx="490" cy="340" r="8"/></g>`,
    ukiyoe: `<path d="M70 332 C160 218 232 372 310 262 S426 178 548 272 L548 444 L70 444Z" fill="${b}" opacity=".65"/><path d="M70 320 C162 210 238 364 316 254 S432 170 548 264" fill="none" stroke="${a}" stroke-width="14"/><path d="M420 116 L520 116 L520 216 Z" fill="${a}" opacity=".72"/>`,
    vorticism: `<path d="M306 260 L84 126 M306 260 L548 102 M306 260 L516 402 M306 260 L130 430 M306 260 L248 80 M306 260 L392 452" stroke="${ink}" stroke-width="10"/><polygon points="252,214 330,194 372,266 318,332 238,302" fill="${ink}"/><polygon points="116,184 208,204 178,258 96,240" fill="${a}"/>`,
    field: `<rect x="72" y="80" width="490" height="350" fill="${a}" opacity=".56"/><rect x="210" y="112" width="352" height="318" fill="${b}" opacity=".42"/><rect x="72" y="260" width="300" height="170" fill="${panel}" opacity=".23"/>`,
  };
  return `<svg viewBox="0 0 620 520" aria-hidden="true">${base[form] || base.minimal}</svg>`;
}

function htmlFor(meta, cfg) {
  const core = meta.style_dna?.core || [];
  const secondary = meta.style_dna?.secondary || [];
  const coreItems = core.slice(0, 4).map((x, i) => `<div class="dna"><span>${String(i + 1).padStart(2, '0')}</span>${esc(x)}</div>`).join('');
  const secondaryItems = secondary.slice(0, 2).map((x) => `<span class="chip">${esc(x)}</span>`).join('');
  const name = esc(meta.name_en || meta.id);
  const period = esc(String(meta.historical_period || '').replace(/[^\x20-\x7E]/g, '-'));
  const signature = esc(core.slice(0, 3).join(' / '));
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box} html,body{margin:0;width:100%;height:100%;overflow:hidden}
  body{width:1536px;height:1024px;background:${cfg.bg};color:${cfg.ink};font-family:"Segoe UI",Arial,sans-serif}
  .canvas{width:1536px;height:1024px;padding:28px;display:grid;grid-template-columns:300px 1fr;gap:22px}
  .rail{background:${cfg.ink};color:${cfg.panel};padding:28px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
  .rail:after{content:"";position:absolute;inset:auto -80px -80px auto;width:240px;height:240px;border:1px solid ${cfg.accent};opacity:.42;transform:rotate(18deg)}
  .brand{display:flex;align-items:center;gap:14px;font-size:13px;letter-spacing:.22em;font-weight:800}.mark{width:34px;height:34px;background:${cfg.accent};display:inline-block}
  .rail h2{font:500 48px/1 Georgia,serif;margin:68px 0 16px;letter-spacing:-.03em}.rail .period{font-size:11px;letter-spacing:.18em;color:${cfg.accent}}
  .mini{border-top:1px solid color-mix(in srgb,${cfg.panel} 28%,transparent);padding-top:18px;font-size:11px;line-height:1.7;color:color-mix(in srgb,${cfg.panel} 78%,transparent)}
  .main{background:${cfg.panel};padding:34px 38px;display:grid;grid-template-rows:128px 1fr 170px;gap:22px;position:relative;overflow:hidden}
  .main:before{content:"";position:absolute;left:38px;right:38px;top:132px;height:8px;background:${cfg.accent};opacity:.95}
  header{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;gap:28px}.eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:color-mix(in srgb,${cfg.ink} 60%,transparent)}
  h1{font-size:62px;line-height:.95;margin:12px 0 0;letter-spacing:-.045em}.summary{max-width:520px;font-size:14px;line-height:1.55;margin-top:30px}
  .body{position:relative;z-index:1;display:grid;grid-template-columns:1.1fr .9fr;gap:24px;min-height:0}.panel{border:1px solid color-mix(in srgb,${cfg.ink} 22%,transparent);background:color-mix(in srgb,${cfg.panel} 88%,white);padding:22px;overflow:hidden}
  .signature{display:flex;align-items:center;justify-content:center}.signature svg{width:100%;height:100%;max-height:520px}
  .side{display:grid;grid-template-rows:1fr 1fr;gap:24px}.panel h3{margin:0 0 18px;font-size:13px;letter-spacing:.18em;text-transform:uppercase}.dna{display:grid;grid-template-columns:44px 1fr;gap:12px;border-top:1px solid color-mix(in srgb,${cfg.ink} 18%,transparent);padding:13px 0;font-size:13px;line-height:1.35}.dna span{font-weight:800;color:${cfg.accent}}
  .chips{display:flex;flex-wrap:wrap;gap:10px}.chip{border:1px solid color-mix(in srgb,${cfg.ink} 22%,transparent);padding:10px 12px;font-size:12px;background:color-mix(in srgb,${cfg.accent} 14%,transparent)}
  .bottom{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px}.metric{font:600 34px/1 Georgia,serif;margin:8px 0}.label{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:color-mix(in srgb,${cfg.ink} 60%,transparent)}
  .chart svg{width:100%;height:74px;margin-top:14px}.bars{display:flex;align-items:end;gap:8px;height:80px;margin-top:12px}.bars i{display:block;width:100%;background:${cfg.accent}}.bars i:nth-child(2n){background:${cfg.aux}}
  .caption{position:absolute;right:38px;bottom:16px;font-size:9px;letter-spacing:.2em;color:color-mix(in srgb,${cfg.ink} 45%,transparent)}
  body[data-form="destijl"] .main, body[data-form="hardedge"] .main{border-left:20px solid ${cfg.accent}} body[data-form="opart"] .main{background:repeating-linear-gradient(90deg,${cfg.panel} 0 10px,#e5e5e1 11px 12px)}
  body[data-form="dada"] .panel:nth-child(odd){transform:rotate(-.7deg)} body[data-form="dada"] .panel:nth-child(even){transform:rotate(.6deg)}
  body[data-form="rococo"] .panel, body[data-form="orphism"] .panel, body[data-form="field"] .panel{border-radius:24px}
  body.long h1{font-size:48px;line-height:1.02;letter-spacing:-.035em}
  body.long .rail h2{font-size:34px;line-height:1.05;overflow-wrap:anywhere}
  body.long .summary{font-size:13px}
  </style></head><body data-form="${cfg.form}" class="${name.length > 15 ? 'long' : ''}"><div class="canvas"><aside class="rail"><div><div class="brand"><span class="mark"></span>STYLE OVERVIEW</div><h2>${name}</h2><div class="period">${period}</div></div><div class="mini">Local overview render. Project-authored HTML/CSS/SVG. No third-party image input. Generated from the recorded Style DNA and UI translation constraints.</div></aside><main class="main"><header><div><div class="eyebrow">Art history UI style</div><h1>${name}</h1></div><p class="summary">${signature}. This overview maps visual DNA into layout, hierarchy, chart language, interaction surfaces, and reusable preview rules.</p></header><section class="body"><article class="panel signature">${motif(cfg.form, cfg)}</article><div class="side"><article class="panel"><h3>Core DNA</h3>${coreItems}</article><article class="panel"><h3>Secondary cues</h3><div class="chips">${secondaryItems}</div><div class="chart">${lineChart(cfg.accent, cfg.aux)}</div></article></div></section><section class="bottom"><article class="panel"><div class="label">Hierarchy signal</div><div class="metric">92</div><div class="bars">${[45,68,52,78,61,88,73].map(h=>`<i style="height:${h}%"></i>`).join('')}</div></article><article class="panel"><div class="label">Translation scope</div><div class="metric">UI + Data</div><p class="summary" style="margin:10px 0 0">Dashboard, evidence map, list, metric, and chart treatment.</p></article><article class="panel"><div class="label">Curation status</div><div class="metric">Review</div><p class="summary" style="margin:10px 0 0">Ready for visual comparison and blind style recognition.</p></article></section><div class="caption">${esc(meta.id).toUpperCase()} / OVERVIEW / 1536X1024</div></main></div></body></html>`;
}

async function main() {
  const requested = new Set(process.argv.slice(2));
  const slugs = fs.readdirSync(STYLES_ROOT).filter((name) => fs.existsSync(path.join(STYLES_ROOT, name, 'style.json'))).sort();
  const unknown = [...requested].filter((slug) => !slugs.includes(slug));
  if (unknown.length) throw new Error(`Unknown style slug(s): ${unknown.join(', ')}`);
  const targetSlugs = requested.size ? slugs.filter((slug) => requested.has(slug)) : slugs;
  const launchOptions = fs.existsSync(EDGE) ? { executablePath: EDGE, headless: true } : { headless: true };
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const url = route.request().url();
    if (/^https?:/i.test(url)) return route.abort();
    return route.continue();
  });
  for (const slug of targetSlugs) {
    const meta = readStyle(slug);
    const cfg = configs[slug] || { bg: '#e5e1d8', panel: '#f6f2e8', ink: '#222222', accent: '#666666', aux: '#999999', form: 'minimal' };
    const outDir = path.join(STYLES_ROOT, slug, 'previews');
    fs.mkdirSync(outDir, { recursive: true });
    await page.setContent(htmlFor(meta, cfg), { waitUntil: 'load' });
    await page.screenshot({ path: path.join(outDir, 'overview_chatgpt_rendered.png'), type: 'png', fullPage: false, animations: 'disabled', caret: 'hide' });
    process.stdout.write(`${slug}\n`);
  }
  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
