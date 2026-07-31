from __future__ import annotations

import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path("design_style_library/styles")
CAPTURED = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
SCOPE = "Local design research and visual analysis only; never publish as owned commercial asset."
LICENSE = "REFERENCE_PAGE_ONLY — image license must be checked before download"

styles = [
    ("renaissance", "Renaissance", "文艺复兴", "c. 1400–1600", ["linear perspective and architectural depth", "measured bilateral balance", "humanist proportion", "calm central focal hierarchy"], ["warm stone and earth neutrals", "clear foreground-to-background depth"], "Do not reduce to parchment texture, antique serif text, or a generic museum card."),
    ("baroque", "Baroque", "巴洛克", "c. 1600–1750", ["theatrical light–dark contrast", "diagonal movement through depth", "volumetric focal drama", "layered spatial recession"], ["deep umber with luminous highlights", "controlled ornamental tension"], "Do not reduce to gold trim, black backgrounds, or luxury-dashboard decoration."),
    ("rococo", "Rococo", "洛可可", "c. 1730–1770", ["airy asymmetrical balance", "shell-like curvilinear rhythm", "delicate ornamental flow", "lightness around the focal content"], ["powdered pastel relationships", "fine, low-contrast detail"], "Do not reduce to pink gradients, generic florals, or decorative excess that harms reading."),
    ("neoclassicism", "Neoclassicism", "新古典主义", "c. 1760–1850", ["disciplined bilateral order", "columnar and rectilinear rhythm", "measured proportions", "restrained civic gravity"], ["stone, ink, muted red accents", "crisp contour and generous margins"], "Do not reduce to Greek-key borders, gold ornament, or institutional stiffness."),
    ("romanticism", "Romanticism", "浪漫主义", "c. 1800–1850", ["sublime scale contrast", "atmospheric depth", "diagonal weather or light movement", "small human-scale focal point"], ["luminous dusk and storm color", "soft-to-sharp depth transitions"], "Do not reduce to a dark scenic backdrop or an emotional poster."),
    ("impressionism", "Impressionism", "印象派", "c. 1860–1886", ["transient light as hierarchy", "broken neighboring color", "soft edge grouping", "open breathable composition"], ["high-key light-sensitive palette", "optical color vibration"], "Do not reduce to pastel filters or decorative brush texture over a standard grid."),
    ("post_impressionism", "Post-Impressionism", "后印象派", "c. 1886–1905", ["constructed color masses", "expressive contour or faceting", "deliberate flattening of depth", "rhythmic color-led grouping"], ["saturated but organized color", "structural brush-like segmentation"], "Do not reduce to an arbitrary bright palette or generic painterly noise."),
    ("expressionism", "Expressionism", "表现主义", "c. 1905–1920", ["emotionally charged color contrast", "acute directional tension", "intentionally distorted planes", "bold graphic silhouette"], ["high-contrast non-natural color", "dark structural contour"], "Do not reduce to an unreadable dark interface or random aggressive marks."),
    ("cubism", "Cubism", "立体主义", "c. 1907–1914", ["simultaneous viewpoints", "interlocking faceted planes", "shallow assembled space", "fragmented but legible hierarchy"], ["earthy neutrals with selective color", "collage-like material distinction"], "Do not reduce to low-poly decoration or a conventional card grid with angular corners."),
    ("futurism", "Futurism", "未来主义", "c. 1909–1916", ["directional velocity", "sequential repetition", "force-line composition", "fragmented motion across depth"], ["electric contrast used as motion cue", "radiating directional marks"], "Do not reduce to a sci-fi HUD, generic speed lines, or neon cyberpunk."),
    ("dada", "Dada", "达达主义", "c. 1916–1924", ["deliberate collision of found forms", "disrupted type–image relationship", "chance-like but curated juxtaposition", "ironic scale shift"], ["print, cut-paper, and ink contrast", "limited disruptive accent color"], "Do not reduce to random glitch, unreadable collage, or internet meme aesthetics."),
    ("suprematism", "Suprematism", "至上主义", "from 1915", ["non-objective floating geometry", "weightless white field", "independent geometric hierarchy", "off-axis spatial balance"], ["pure color masses", "absence of enclosing grid"], "Do not confuse with De Stijl: no black ruled grid or pane-based orthogonal matrix."),
]

reference_map = {
    "renaissance": [
        ("The Met — Florence and Central Italy, 1400–1600", "https://82nd-and-fifth.metmuseum.org/toah/ht/08/eustc.html"),
        ("The Met — Timeline of Art History", "https://www.metmuseum.org/essays/timeline-of-art-history"),
        ("The Met — Italian Renaissance collection search", "https://www.metmuseum.org/art/collection/search#!?q=Italian%20Renaissance"),
    ],
    "baroque": [("The Met — Baroque art overview", "https://www.metmuseum.org/toah/hd/baro/hd_baro.htm"), ("The Met — European paintings collection", "https://www.metmuseum.org/art/collection/search#!?department=11"), ("National Gallery — Baroque", "https://www.nationalgallery.org.uk/paintings/learn-about-art/baroque-art")],
    "rococo": [("The Met — Rococo art overview", "https://www.metmuseum.org/toah/hd/roco/hd_roco.htm"), ("The Met — European decorative arts", "https://www.metmuseum.org/art/collection/search#!?department=12"), ("V&A — Rococo", "https://www.vam.ac.uk/articles/rococo-style")],
    "neoclassicism": [("The Met — Neoclassicism overview", "https://www.metmuseum.org/toah/hd/neoc/hd_neoc.htm"), ("The Met — Neoclassical art collection search", "https://www.metmuseum.org/art/collection/search#!?q=Neoclassicism"), ("National Gallery — Neoclassicism", "https://www.nationalgallery.org.uk/paintings/learn-about-art/neoclassicism")],
    "romanticism": [("The Met — Romanticism", "https://www.metmuseum.org/essays/romanticism"), ("The Met — Romanticism collection search", "https://www.metmuseum.org/art/collection/search#!?q=Romanticism"), ("Tate — Romanticism", "https://www.tate.org.uk/art/art-terms/r/romanticism")],
    "impressionism": [("The Met — Impressionism overview", "https://www.metmuseum.org/toah/hd/imml/hd_imml.htm"), ("The Met — Impressionism collection search", "https://www.metmuseum.org/art/collection/search#!?q=Impressionism"), ("Tate — Impressionism", "https://www.tate.org.uk/art/art-terms/i/impressionism")],
    "post_impressionism": [("The Met — Post-Impressionism overview", "https://www.metmuseum.org/toah/hd/poim/hd_poim.htm"), ("The Met — Post-Impressionism collection search", "https://www.metmuseum.org/art/collection/search#!?q=Post-Impressionism"), ("Tate — Post-Impressionism", "https://www.tate.org.uk/art/art-terms/p/post-impressionism")],
    "expressionism": [("MoMA — Expressionism", "https://www.moma.org/collection/terms/expressionism/responding-to-the-anxiety-of-modern-life"), ("MoMA — Expressionism collection", "https://www.moma.org/collection/works?classification=Paintings&theme=Expressionism"), ("Tate — Expressionism", "https://www.tate.org.uk/art/art-terms/e/expressionism")],
    "cubism": [("MoMA — What Is Cubism?", "https://www.moma.org/collection/terms/cubism/what-is-cubism"), ("MoMA — Cubism", "https://www.moma.org/collection/terms/cubism"), ("Tate — Cubism", "https://www.tate.org.uk/art/art-terms/c/cubism")],
    "futurism": [("MoMA — Futurism", "https://www.moma.org/collection/terms/futurism"), ("Tate — Futurism", "https://www.tate.org.uk/art/art-terms/f/futurism"), ("Guggenheim — Italian Futurism", "https://www.guggenheim.org/artwork/movement/futurism")],
    "dada": [("MoMA — Dada", "https://www.moma.org/collection/terms/dada"), ("Tate — Dada", "https://www.tate.org.uk/art/art-terms/d/dada"), ("The Met — Dada collection search", "https://www.metmuseum.org/art/collection/search#!?q=Dada")],
    "suprematism": [("MoMA — Suprematism", "https://www.moma.org/collection/terms/suprematism"), ("MoMA — Suprematist Composition: White on White", "https://www.moma.org/collection/works/79810"), ("Tate — Suprematism", "https://www.tate.org.uk/art/art-terms/s/suprematism")],
}

def write_text(path: Path, text: str) -> None:
    path.write_text(text + "\n", encoding="utf-8")

registry = []
for slug, en, zh, period, core, secondary, avoid in styles:
    folder = ROOT / slug
    (folder / "references" / "historical").mkdir(parents=True, exist_ok=True)
    (folder / "previews").mkdir(exist_ok=True)
    refs = [{"id": f"{slug}_h{i}", "title": title, "source_url": url, "source_type": "MUSEUM_OR_INSTITUTION_PAGE", "captured_at": CAPTURED, "license_status": LICENSE, "usage_scope": SCOPE} for i, (title, url) in enumerate(reference_map[slug], 1)]
    payload = {"id": slug, "name_en": en, "name_zh": zh, "taxonomy": "ART_HISTORY_STYLE", "historical_period": period, "style_dna": {"core": core, "secondary": secondary}, "ui_translation_status": "DRAFT_STRUCTURED", "preview_status": "GENERATION_PENDING", "placeholder_preview": False, "references": refs, "previews": [], "generation_method": "Pending: short DNA prompt; single style and single intensity; generated image will be copied and provenance recorded.", "pairwise_differentiation": {"required_signature": core[:3], "veto": [avoid]}, "completion_flags": ["STYLE_REFERENCE_VALID", "STYLE_DNA_VALID", "UI_TRANSLATION_VALID"]}
    (folder / "style.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (folder / "references" / "historical" / "reference_manifest.json").write_text(json.dumps(refs, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_text(folder / "STYLE_DNA.md", f"# {en} / {zh} — Style DNA\n\n## Historical definition\n{period}; an art-historical style, not a surface theme.\n\n## Core references\n" + "\n".join(f"- [{r['title']}]({r['source_url']})" for r in refs) + "\n\n## Core DNA\n" + "\n".join(f"- `{v}` — CORE" for v in core) + "\n\n## Secondary DNA\n" + "\n".join(f"- `{v}` — SECONDARY" for v in secondary) + f"\n\n## Anti-mimicry rule\n{avoid}\n\n## Evidence policy\nOnline references are for local research only. Each record keeps URL, capture time and license status; no third-party image is claimed as a commercial asset.")
    write_text(folder / "UI_TRANSLATION.md", f"# {en} — UI translation\n\n## Structure\nTranslate `{core[0]}` and `{core[1]}` into layout, information hierarchy and component geometry before color or ornament.\n\n## Components\nNavigation, charts, filters, tables and state indicators must remain legible; the style changes their relationships, not only their skin.\n\n## Intensity\n- **LOW**: one or two core compositional cues in a mature product shell.\n- **MEDIUM**: composition, typography rhythm and color roles visibly follow the DNA.\n- **HIGH**: strong spatial grammar while retaining navigation, KPIs, chart, list, table and states.\n\n## Curation rule\nPairwise distinction is a selection criterion, not permission to add noise. Keep the most elegant, historically coherent and usable candidate; discard weaker near-duplicates.")
    registry.append({"id": slug, "name_en": en, "name_zh": zh, "path": f"styles/{slug}", "preview_status": "GENERATION_PENDING"})

(ROOT / "ART_HISTORY_STYLE_SECOND_WAVE.json").write_text(json.dumps({"wave": 2, "count": len(registry), "created_at": CAPTURED, "policy": SCOPE, "styles": registry}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Created {len(registry)} second-wave historical styles.")
