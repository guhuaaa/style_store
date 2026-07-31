const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const stylesRoot = path.join(root, "design_style_library", "styles");
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const styles = {
  renaissance: {
    label: "Renaissance",
    period: "1400—1600",
    bg: "#d7c4a7", paper: "#f7f0df", ink: "#2d251e", accent: "#9d3d2e", aux: "#71826d",
    signature: "CENTRAL PERSPECTIVE / MEASURED PROPORTION",
  },
  baroque: {
    label: "Baroque",
    period: "1600—1750",
    bg: "#130f12", paper: "#251c22", ink: "#f6ead1", accent: "#c9963b", aux: "#7f2135",
    signature: "THEATRICAL LIGHT / DIAGONAL DEPTH",
  },
  rococo: {
    label: "Rococo",
    period: "1730—1770",
    bg: "#d9dbe8", paper: "#fff9f3", ink: "#485267", accent: "#c9899e", aux: "#89a79b",
    signature: "ASYMMETRICAL GRACE / SHELL RHYTHM",
  },
  neoclassicism: {
    label: "Neoclassicism",
    period: "1760—1850",
    bg: "#c9c6bd", paper: "#f2f0e9", ink: "#272a31", accent: "#8f2f34", aux: "#9b8c70",
    signature: "CIVIC ORDER / COLUMNAR RHYTHM",
  },
  romanticism: {
    label: "Romanticism",
    period: "1800—1850",
    bg: "#162230", paper: "#293744", ink: "#f0e6d1", accent: "#dc7a45", aux: "#6e8aa0",
    signature: "SUBLIME SCALE / ATMOSPHERIC FORCE",
  },
  impressionism: {
    label: "Impressionism",
    period: "1860—1886",
    bg: "#b9d4d0", paper: "#faf4d8", ink: "#344b4f", accent: "#e18162", aux: "#7697b9",
    signature: "TRANSIENT LIGHT / BROKEN COLOR",
  },
  post_impressionism: {
    label: "Post‑Impressionism",
    period: "1886—1905",
    bg: "#234f65", paper: "#f2c84d", ink: "#182f39", accent: "#d9503f", aux: "#4f7d4a",
    signature: "CONSTRUCTED COLOR / EXPRESSIVE CONTOUR",
  },
  expressionism: {
    label: "Expressionism",
    period: "1905—1920",
    bg: "#26142d", paper: "#e3bb36", ink: "#241327", accent: "#dc3d32", aux: "#2c7690",
    signature: "EMOTIONAL COLOR / DISTORTED PLANES",
  },
  cubism: {
    label: "Cubism",
    period: "1907—1914",
    bg: "#8d8270", paper: "#d9cfbb", ink: "#2e2a27", accent: "#735c42", aux: "#66757b",
    signature: "MULTIPLE VIEWPOINTS / FACETED SPACE",
  },
  futurism: {
    label: "Futurism",
    period: "1909—1916",
    bg: "#12171c", paper: "#e7e0d0", ink: "#171d23", accent: "#ef4b2f", aux: "#2e7186",
    signature: "VELOCITY / FORCE LINES",
  },
  dada: {
    label: "Dada",
    period: "1916—1924",
    bg: "#c4b9a2", paper: "#efe9dc", ink: "#171717", accent: "#b92e28", aux: "#295a78",
    signature: "CURATED COLLISION / TYPE–IMAGE DISRUPTION",
  },
  suprematism: {
    label: "Suprematism",
    period: "FROM 1915",
    bg: "#e9e7df", paper: "#faf9f5", ink: "#161616", accent: "#d83b2f", aux: "#245b9b",
    signature: "FLOATING GEOMETRY / WEIGHTLESS FIELD",
  },
};

function chartSvg(accent, aux) {
  return `<svg viewBox="0 0 620 180" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 145 C55 120 78 142 125 103 S210 123 255 73 S350 110 392 56 S480 83 520 37 S580 58 620 20"
      fill="none" stroke="${accent}" stroke-width="5"/>
    <path d="M0 158 C70 150 98 121 148 133 S245 82 301 101 S395 68 452 77 S555 42 620 54"
      fill="none" stroke="${aux}" stroke-width="3" opacity=".8"/>
  </svg>`;
}

function graphSvg(accent, aux) {
  return `<svg viewBox="0 0 420 260" aria-hidden="true">
    <g stroke="currentColor" opacity=".28" stroke-width="2">
      <path d="M58 142L150 74 235 125 346 58M150 74l24 130 61-79 98 71M58 142l116 62M235 125l98 71"/>
    </g>
    <g stroke="#fff" stroke-width="3">
      <circle cx="58" cy="142" r="22" fill="${aux}"/><circle cx="150" cy="74" r="28" fill="${accent}"/>
      <circle cx="235" cy="125" r="20" fill="${aux}"/><circle cx="346" cy="58" r="17" fill="${accent}"/>
      <circle cx="174" cy="204" r="18" fill="${accent}"/><circle cx="333" cy="196" r="25" fill="${aux}"/>
    </g>
  </svg>`;
}

function html(slug, s, level) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box} html,body{margin:0;width:100%;height:100%;overflow:hidden}
  body{--bg:${s.bg};--paper:${s.paper};--ink:${s.ink};--accent:${s.accent};--aux:${s.aux};
    --force:${level === "low" ? ".35" : level === "medium" ? ".68" : "1"};
    background:var(--bg);color:var(--ink);font-family:"Segoe UI",Arial,sans-serif}
  .canvas{position:relative;width:1440px;height:900px;padding:34px 40px;overflow:hidden}
  .shell{position:relative;height:100%;background:var(--paper);box-shadow:0 28px 70px #0003;overflow:hidden}
  header{height:96px;padding:23px 32px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid color-mix(in srgb,var(--ink) 20%,transparent)}
  .brand{display:flex;gap:18px;align-items:center}.mark{width:42px;height:42px;background:var(--accent)}
  .brand h1{font:600 26px/1 Georgia,serif;margin:0}.brand small,.meta,.eyebrow{letter-spacing:.14em;text-transform:uppercase;font-size:10px}
  .status{display:flex;gap:10px;align-items:center}.pill{padding:10px 14px;border:1px solid color-mix(in srgb,var(--ink) 22%,transparent);font-size:12px}
  main{display:grid;grid-template-columns:220px 1fr;height:calc(100% - 96px)}
  nav{padding:25px 20px;border-right:1px solid color-mix(in srgb,var(--ink) 18%,transparent)}
  nav b{display:block;margin:12px;padding:12px 14px;font-size:13px}.active{background:var(--accent);color:white}
  .work{padding:26px 30px;display:grid;grid-template-rows:auto 122px 1fr 180px;gap:18px}
  .title{display:flex;align-items:end;justify-content:space-between}.title h2{font:500 42px/1 Georgia,serif;margin:0}.title p{max-width:460px;margin:0;font-size:13px;line-height:1.5}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{position:relative;padding:18px;border:1px solid color-mix(in srgb,var(--ink) 20%,transparent);background:color-mix(in srgb,var(--paper) 88%,white)}
  .metric{font:500 31px/1.1 Georgia,serif;margin-top:14px}.delta{color:var(--accent);font-size:11px;margin-top:7px}
  .middle{display:grid;grid-template-columns:1.55fr .85fr;gap:18px}.panel{padding:20px;border:1px solid color-mix(in srgb,var(--ink) 20%,transparent);position:relative;overflow:hidden}
  .panel h3{margin:0 0 16px;font:600 14px/1.2 Arial,sans-serif}.chart{height:190px}.graph{height:220px;color:var(--ink)}
  .queue{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:14px}.queue .row{display:flex;justify-content:space-between;margin-top:13px;font-size:12px;border-bottom:1px solid color-mix(in srgb,var(--ink) 16%,transparent);padding-bottom:8px}
  .signature{position:absolute;z-index:0;pointer-events:none}.shell > :not(.signature){position:relative;z-index:1}
  .caption{position:absolute;right:46px;bottom:16px;z-index:5;color:color-mix(in srgb,var(--ink) 62%,transparent);font-size:9px;letter-spacing:.16em}

  body.renaissance .shell{border:12px solid color-mix(in srgb,var(--paper) 80%,var(--bg))}
  body.renaissance .signature{inset:96px 0 0;background:linear-gradient(77deg,transparent 49.6%,color-mix(in srgb,var(--accent) calc(var(--force)*18%),transparent) 50%,transparent 50.4%),linear-gradient(103deg,transparent 49.6%,color-mix(in srgb,var(--accent) calc(var(--force)*18%),transparent) 50%,transparent 50.4%)}
  body.renaissance .work{max-width:1040px;margin:auto} body.renaissance .title{text-align:center;display:block} body.renaissance .title p{margin:12px auto 0}

  body.baroque .canvas{background:radial-gradient(circle at 75% 24%,#e2b65c55,transparent 28%),var(--bg)}
  body.baroque .shell{transform:skewY(-.5deg);background:linear-gradient(128deg,var(--paper) 65%,#5c2730)}
  body.baroque .middle{grid-template-columns:.9fr 1.5fr}.baroque .title h2{font-size:54px;font-style:italic}.baroque .signature{width:700px;height:1600px;right:-360px;top:-500px;background:#f4ca7b22;transform:rotate(24deg)}

  body.rococo .shell{border-radius:42px 12px 50px 16px}.rococo .mark{border-radius:70% 30% 65% 35%;transform:rotate(18deg)}
  body.rococo .card,.rococo .panel{border-radius:28px 8px 30px 12px}.rococo .signature{width:480px;height:480px;right:-110px;top:-110px;border:36px double #c9899e55;border-radius:52% 48% 42% 58%;transform:rotate(22deg)}
  body.rococo .work{padding-left:54px}.rococo .kpis{transform:translateX(-18px)}

  body.neoclassicism .shell{border-top:14px solid var(--ink)}.neoclassicism header{border-bottom:4px double var(--ink)}
  .neoclassicism nav{border-right:7px double var(--ink)}.neoclassicism .card,.neoclassicism .panel{border-radius:0;border-top:4px solid var(--ink)}
  .neoclassicism .kpis{gap:24px}.neoclassicism .mark{background:transparent;border:8px double var(--accent)}

  body.romanticism .shell{background:linear-gradient(145deg,#e4dfce 0 36%,var(--paper) 62%);clip-path:polygon(0 0,100% 0,100% 94%,77% 100%,0 96%)}
  .romanticism .signature{inset:-200px -100px auto auto;width:1000px;height:700px;background:radial-gradient(ellipse at center,#ffb45b55,transparent 55%);transform:rotate(-18deg)}
  .romanticism .title h2{font-size:58px}.romanticism .middle{grid-template-columns:1.8fr .7fr}

  body.impressionism .canvas{background:radial-gradient(circle at 18% 20%,#f7d889 0 3%,transparent 4%),radial-gradient(circle at 80% 68%,#da8068 0 4%,transparent 5%),var(--bg)}
  .impressionism .shell{box-shadow:0 20px 80px #476e6d66;filter:saturate(calc(.85 + var(--force)*.3))}
  .impressionism .card,.impressionism .panel{border:0;background:linear-gradient(135deg,#fff8dccc,#c7dfe0aa);box-shadow:8px 8px 0 #799bb333}
  .impressionism .signature{inset:0;background:radial-gradient(circle,#e1816244 0 5px,transparent 6px);background-size:47px 39px;opacity:calc(var(--force)*.35)}

  body.post_impressionism .shell{border:8px solid var(--ink)}.post_impressionism header,.post_impressionism nav,.post_impressionism .card,.post_impressionism .panel{border:3px solid var(--ink)}
  .post_impressionism .card:nth-child(2n){background:#e78955}.post_impressionism .panel:first-child{background:#f1d56a}.post_impressionism .panel:last-child{background:#68a0a5}
  .post_impressionism .mark{border-radius:50%;box-shadow:inset 0 0 0 6px var(--paper)}

  body.expressionism .shell{transform:rotate(-.35deg);border:9px solid var(--ink)}
  .expressionism .card:nth-child(odd),.expressionism .panel:nth-child(even){transform:skewY(-2deg) rotate(-1deg)}.expressionism .card:nth-child(even){transform:skewY(2deg) rotate(1deg)}
  .expressionism .title h2{font:bold italic 52px/1 Arial,sans-serif;text-transform:uppercase}.expressionism .signature{inset:0;background:linear-gradient(25deg,transparent 65%,#dc3d3233 66% 71%,transparent 72%)}

  body.cubism .shell{clip-path:polygon(2% 0,100% 3%,98% 97%,0 100%)}.cubism .work{transform:skewX(-1deg)}
  .cubism .card{clip-path:polygon(0 9%,86% 0,100% 85%,12% 100%)}.cubism .panel:first-child{clip-path:polygon(0 0,96% 5%,100% 90%,3% 100%)}.cubism .panel:last-child{clip-path:polygon(8% 0,100% 8%,93% 100%,0 88%)}
  .cubism .signature{inset:0;background:linear-gradient(135deg,transparent 40%,#735c4233 41% 52%,transparent 53%),linear-gradient(35deg,transparent 63%,#66757b33 64% 74%,transparent 75%)}

  body.futurism .shell{transform:skewX(-2deg)}.futurism .title h2{font:900 italic 50px/1 Arial,sans-serif;text-transform:uppercase;letter-spacing:-.05em}
  .futurism .kpis,.futurism .middle,.futurism .queue{transform:translateX(calc(var(--force)*18px))}
  .futurism .signature{inset:0;background:repeating-linear-gradient(165deg,transparent 0 32px,#ef4b2f22 33px 36px);transform:translateX(70px)}

  body.dada .shell{background:#efe9dc}.dada header{transform:rotate(-1deg);background:#f5f0e7}.dada nav{transform:rotate(.8deg);background:#d8cfbc}
  .dada .card:nth-child(1){transform:rotate(-2deg)}.dada .card:nth-child(2){transform:rotate(1.5deg);background:#b92e28;color:#fff}.dada .card:nth-child(3){transform:rotate(-1deg)}.dada .card:nth-child(4){transform:rotate(2deg);background:#222;color:#fff}
  .dada .panel{box-shadow:9px 10px 0 #0003}.dada .title h2{font:900 48px/1 Impact,Arial,sans-serif;text-transform:uppercase}.dada .signature{width:520px;height:70px;right:-110px;top:160px;background:var(--accent);transform:rotate(-8deg);opacity:calc(var(--force)*.38)}

  body.suprematism .shell{box-shadow:none}.suprematism nav{background:white}.suprematism .card,.suprematism .panel{border:0;box-shadow:0 2px 0 #0002}
  .suprematism .signature{inset:0;background:linear-gradient(24deg,transparent 70%,#d83b2f00 71%)}
  .suprematism .signature:before,.suprematism .signature:after{content:"";position:absolute;display:block}
  .suprematism .signature:before{width:150px;height:42px;background:var(--accent);right:70px;top:145px;transform:rotate(23deg);opacity:var(--force)}
  .suprematism .signature:after{width:84px;height:84px;background:var(--aux);border-radius:50%;left:180px;bottom:65px;opacity:var(--force)}
  </style></head><body class="${slug}">
  <div class="canvas"><div class="shell"><div class="signature"></div>
    <header><div class="brand"><i class="mark"></i><div><h1>Signal Atlas</h1><small>RELATION RISK MONITOR</small></div></div><div class="status"><span class="pill">Live graph</span><span class="pill">${s.period}</span></div></header>
    <main><nav><span class="eyebrow">Workspaces</span><b class="active">Risk overview</b><b>Entity graph</b><b>Event stream</b><b>Scenario lab</b><b>Evidence</b><b>Settings</b></nav>
    <section class="work"><div class="title"><div><span class="eyebrow">${s.label}</span><h2>Systemic risk field</h2></div><p>${s.signature}. Monitor connected entities, transmission paths and evidence confidence without losing the art-historical spatial grammar.</p></div>
    <div class="kpis">${[["Entities watched","2,486","+12 today"],["Critical paths","37","−4 resolved"],["Evidence confidence","91.6%","+2.3%"],["Open signals","128","18 urgent"]].map(x=>`<article class="card"><span class="meta">${x[0]}</span><div class="metric">${x[1]}</div><div class="delta">${x[2]}</div></article>`).join("")}</div>
    <div class="middle"><article class="panel"><h3>Transmission pressure · 30 days</h3><div class="chart">${chartSvg(s.accent,s.aux)}</div></article><article class="panel"><h3>Entity relationship cluster</h3><div class="graph">${graphSvg(s.accent,s.aux)}</div></article></div>
    <div class="queue"><article class="panel"><h3>Priority signals</h3><div class="row"><span>Liquidity linkage</span><b>Critical</b></div><div class="row"><span>Supplier concentration</span><b>High</b></div><div class="row"><span>Sentiment acceleration</span><b>Watch</b></div></article><article class="panel"><h3>Scenario delta</h3><div class="metric">−18.4%</div><div class="delta">Modeled exposure after controls</div></article><article class="panel"><h3>Evidence coverage</h3><div class="metric">84 / 92</div><div class="delta">Sources verified in current window</div></article></div>
    </section></main><div class="caption">LOCAL ORIGINAL RENDER · ${s.label.toUpperCase()} · ${level.toUpperCase()}</div>
  </div></div></body></html>`;
}

async function main() {
  if (!fs.existsSync(edge)) throw new Error(`Edge executable not found: ${edge}`);
  const requested = new Set(process.argv.slice(2));
  const unknown = [...requested].filter((slug) => !styles[slug]);
  if (unknown.length) throw new Error(`Unknown style slug(s): ${unknown.join(", ")}`);
  const browser = await chromium.launch({ executablePath: edge, headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (const [slug, config] of Object.entries(styles)) {
    if (requested.size && !requested.has(slug)) continue;
    const previewDir = path.join(stylesRoot, slug, "previews");
    fs.mkdirSync(previewDir, { recursive: true });
    for (const level of ["low", "medium", "high"]) {
      await page.setContent(html(slug, config, level), { waitUntil: "load" });
      await page.screenshot({ path: path.join(previewDir, `${level}_rendered.png`) });
      process.stdout.write(`${slug}/${level}\n`);
    }
  }
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
