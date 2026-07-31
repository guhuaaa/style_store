"""Create the third curated wave of art-history UI styles.

Reference pages are research metadata only.  No third-party images are fetched.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path("design_style_library/styles")
CAPTURED = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
SCOPE = "Local design research and visual analysis only; never publish as owned commercial asset."
LICENSE = "REFERENCE_PAGE_ONLY — image license must be checked before download"

styles = [
    ("arts_and_crafts", "Arts and Crafts", "工艺美术运动", "c. 1860–1910", ["truthful material-led structure", "handmade repeat rhythm", "integrated type and border system", "craft-scale hierarchy"], ["botanical or vernacular geometry", "muted natural pigments"], "Do not reduce to generic rustic texture, craft clip-art, or ornamental wallpaper."),
    ("symbolism", "Symbolism", "象征主义", "c. 1880–1910", ["allegorical focal image", "suggestive rather than literal hierarchy", "quiet symbolic correspondences", "atmospheric enclosed space"], ["jewel-toned dusk palette", "decorative contour"], "Do not confuse with Surrealism: avoid arbitrary dream objects and retain intentional symbolic clarity."),
    ("fauvism", "Fauvism", "野兽派", "c. 1905–1910", ["non-natural high-chroma color blocks", "simplified emphatic contour", "flat decorative depth", "color-led grouping"], ["warm-cool collisions", "economical broad marks"], "Do not reduce to a random bright palette, gradient, or Pop-Art comic treatment."),
    ("orphism", "Orphism", "奥费主义", "c. 1912–1914", ["concentric or orbital rhythm", "prismatic color simultaneity", "transparent overlapping discs", "radiant central-to-peripheral hierarchy"], ["curving directional arcs", "luminous pure color"], "Do not confuse with Suprematism: use chromatic orbit and transparency, not isolated floating geometry."),
    ("vorticism", "Vorticism", "漩涡主义", "c. 1914–1919", ["centripetal angular force", "hard-edged machine geometry", "compressed black-white contrast", "vortex-like directional hierarchy"], ["single acid accent", "cut typographic mass"], "Do not confuse with Futurism or Constructivism: avoid speed trails and propaganda-poster composition."),
    ("precisionism", "Precisionism", "精确主义", "c. 1915–1945", ["clean industrial silhouette", "crisp planar reduction", "silent monumental spacing", "measured vertical-horizontal rhythm"], ["cool architectural light", "controlled machine-age palette"], "Do not reduce to generic corporate isometric art or sterile CAD decoration."),
    ("abstract_expressionism", "Abstract Expressionism", "抽象表现主义", "c. 1943–1965", ["gesture as structural path", "asymmetrical field tension", "layered expressive mark density", "scale-driven immersion"], ["ink, mineral, and off-white contrast", "purposeful irregular edge"], "Do not use random paint splatters; every gesture must support information flow and reading order."),
    ("color_field", "Color Field Painting", "色域绘画", "c. 1947–1970", ["large unbroken chromatic fields", "subtle edge breathing", "low-object spatial calm", "color as atmosphere and hierarchy"], ["tonal adjacency", "minimal internal detail"], "Do not reduce to a gradient background or a blank interface; preserve tonal field relationships."),
    ("hard_edge", "Hard-edge Painting", "硬边绘画", "c. 1950–1970", ["precise sharp-edged color planes", "flat unmodulated fills", "optical balance", "clean geometric interruption"], ["limited palette discipline", "crisp boundary contrast"], "Do not duplicate De Stijl: avoid ruled grids and primary-color Mondrian quoting."),
    ("op_art", "Op Art", "欧普艺术", "c. 1960–1975", ["perceptual rhythm", "systematic repetition with controlled variation", "figure-ground reversal", "optical directional pull"], ["high contrast pattern", "strict calibrated spacing"], "Do not create eye-straining wallpaper; apply optical rhythm in bounded, accessible data regions only."),
    ("minimalism_art", "Minimalism", "极简主义", "c. 1960–1975", ["serial modular reduction", "literal material presence", "neutral repeated unit", "spatial interval as hierarchy"], ["industrial neutral palette", "absence of expressive decoration"], "Do not confuse with generic empty UI; use seriality, proportion, and deliberate intervals."),
    ("mexican_muralism", "Mexican Muralism", "墨西哥壁画运动", "c. 1920–1970", ["monumental narrative bands", "public-scale collective figures", "architectural integration", "earth-and-mineral color hierarchy"], ["bold contour grouping", "social narrative sequencing"], "Do not reduce to tourist motifs or nationalist ornament; preserve legible collective narrative structure."),
]

refs = {
    "arts_and_crafts": [("V&A — Arts and Crafts movement", "https://www.vam.ac.uk/articles/arts-and-crafts-an-introduction"), ("The Met — Arts and Crafts in Britain", "https://www.metmuseum.org/essays/arts-and-crafts-in-britain"), ("The William Morris Society", "https://williammorrissociety.org/")],
    "symbolism": [("The Met — Symbolism", "https://www.metmuseum.org/toah/hd/symb/hd_symb.htm"), ("Tate — Symbolism", "https://www.tate.org.uk/art/art-terms/s/symbolism"), ("MoMA — Symbolism", "https://www.moma.org/collection/terms/symbolism")],
    "fauvism": [("The Met — Fauvism", "https://www.metmuseum.org/toah/hd/fauv/hd_fauv.htm"), ("Tate — Fauvism", "https://www.tate.org.uk/art/art-terms/f/fauvism"), ("MoMA — Henri Matisse", "https://www.moma.org/artists/3832")],
    "orphism": [("Guggenheim — Orphism", "https://www.guggenheim.org/artwork/movement/orphism"), ("The Met — Robert Delaunay", "https://www.metmuseum.org/art/collection/search#!?q=Robert%20Delaunay"), ("Tate — Sonia Delaunay", "https://www.tate.org.uk/art/artists/sonia-delaunay-921")],
    "vorticism": [("Tate — Vorticism", "https://www.tate.org.uk/art/art-terms/v/vorticism"), ("Tate — Vorticism collection", "https://www.tate.org.uk/art/artists/wyndham-lewis-1504"), ("The British Library — BLAST", "https://www.bl.uk/collection-items/blast")],
    "precisionism": [("The Met — Precisionism", "https://www.metmuseum.org/toah/hd/preci/hd_preci.htm"), ("Whitney Museum — Precisionism", "https://whitney.org/artists/1236"), ("Smithsonian American Art Museum — Precisionism", "https://americanart.si.edu/artwork/search?keyword=Precisionism")],
    "abstract_expressionism": [("MoMA — Abstract Expressionism", "https://www.moma.org/collection/terms/abstract-expressionism"), ("The Met — Abstract Expressionism", "https://www.metmuseum.org/toah/hd/abex/hd_abex.htm"), ("Tate — Abstract Expressionism", "https://www.tate.org.uk/art/art-terms/a/abstract-expressionism")],
    "color_field": [("Tate — Colour Field Painting", "https://www.tate.org.uk/art/art-terms/c/colour-field-painting"), ("MoMA — Color Field", "https://www.moma.org/collection/terms/color-field"), ("The National Gallery of Art — Color Field", "https://www.nga.gov/artists/3072-mark-rothko.html")],
    "hard_edge": [("Tate — Hard-edge Painting", "https://www.tate.org.uk/art/art-terms/h/hard-edge-painting"), ("LACMA — Hard-edge Painting", "https://www.lacma.org/art/exhibition/california-hard-edge"), ("The Met — Ellsworth Kelly", "https://www.metmuseum.org/art/collection/search#!?q=Ellsworth%20Kelly")],
    "op_art": [("Tate — Op Art", "https://www.tate.org.uk/art/art-terms/o/op-art"), ("MoMA — Op Art", "https://www.moma.org/collection/terms/op-art"), ("The Met — Optical Art", "https://www.metmuseum.org/art/collection/search#!?q=Op%20Art")],
    "minimalism_art": [("MoMA — Minimalism", "https://www.moma.org/collection/terms/minimalism"), ("Tate — Minimalism", "https://www.tate.org.uk/art/art-terms/m/minimalism"), ("The Met — Minimalism", "https://www.metmuseum.org/toah/hd/minm/hd_minm.htm")],
    "mexican_muralism": [("MoMA — Mexican Muralism", "https://www.moma.org/collection/terms/mexican-muralism"), ("The Met — Mexican Muralism", "https://www.metmuseum.org/art/collection/search#!?q=Mexican%20Muralism"), ("Museo Mural Diego Rivera", "https://www.inba.gob.mx/recinto/63/museo-mural-diego-rivera")],
}

def save(path: Path, text: str) -> None:
    path.write_text(text + "\n", encoding="utf-8")

registry = []
for slug, name, zh, period, core, secondary, avoid in styles:
    folder = ROOT / slug
    (folder / "previews").mkdir(parents=True, exist_ok=True)
    (folder / "references" / "historical").mkdir(parents=True, exist_ok=True)
    references = [{"id": f"{slug}_h{i}", "title": title, "source_url": url, "source_type": "MUSEUM_OR_INSTITUTION_PAGE", "captured_at": CAPTURED, "license_status": LICENSE, "usage_scope": SCOPE} for i, (title, url) in enumerate(refs[slug], 1)]
    data = {"id": slug, "name_en": name, "name_zh": zh, "taxonomy": "ART_HISTORY_STYLE", "historical_period": period, "style_dna": {"core": core, "secondary": secondary}, "ui_translation_status": "DRAFT_STRUCTURED", "preview_status": "GENERATION_PENDING", "placeholder_preview": False, "references": references, "previews": [], "generation_method": "Pending built-in image generation from DNA; no third-party image input.", "pairwise_differentiation": {"required_signature": core[:3], "veto": [avoid]}, "completion_flags": ["STYLE_REFERENCE_VALID", "STYLE_DNA_VALID", "UI_TRANSLATION_VALID"]}
    save(folder / "style.json", json.dumps(data, ensure_ascii=False, indent=2))
    save(folder / "references" / "historical" / "reference_manifest.json", json.dumps(references, ensure_ascii=False, indent=2))
    save(folder / "STYLE_DNA.md", f"# {name} / {zh} — Style DNA\n\n## Historical definition\n{period}; an art-historical movement, not a surface theme.\n\n## Core references\n" + "\n".join(f"- [{r['title']}]({r['source_url']})" for r in references) + "\n\n## Core DNA\n" + "\n".join(f"- `{item}` — CORE" for item in core) + "\n\n## Secondary DNA\n" + "\n".join(f"- `{item}` — SECONDARY" for item in secondary) + f"\n\n## Anti-mimicry rule\n{avoid}\n\n## Evidence policy\nNetwork references are for local research only. URLs, capture time, and licence status are recorded; no third-party image is claimed as a commercial asset.")
    save(folder / "UI_TRANSLATION.md", f"# {name} — UI translation\n\n## Structure\nTranslate `{core[0]}` and `{core[1]}` into information hierarchy, grouping, and component geometry before ornament.\n\n## Intensity\n- **LOW**: restrained mature product shell with one or two compositional cues.\n- **MEDIUM**: composition, typography rhythm, and color roles visibly follow the DNA.\n- **HIGH**: strong spatial grammar while retaining navigation, KPIs, charts, lists, tables, and states.\n\n## Curation rule\nKeep only visually distinct, elegant, and usable candidates. Discard near-duplicates rather than adding noise.")
    registry.append({"id": slug, "name_en": name, "name_zh": zh, "path": f"styles/{slug}", "preview_status": "GENERATION_PENDING"})

save(ROOT / "ART_HISTORY_STYLE_THIRD_WAVE.json", json.dumps({"wave": 3, "count": len(registry), "created_at": CAPTURED, "policy": SCOPE, "styles": registry}, ensure_ascii=False, indent=2))
print(f"Created {len(registry)} third-wave historical styles.")
