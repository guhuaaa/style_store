"""Remove superseded generic SVG previews and their library entries.

Targets are intentionally narrow: legacy images/frontend and images/art entries,
plus first-wave SVG drafts. Curated PNG and rendered previews are retained.
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path("design_style_library")

def remove(path: Path) -> None:
    if path.is_dir():
        shutil.rmtree(path)
    elif path.exists():
        path.unlink()

def main() -> None:
    legacy_image_roots = [ROOT / "images" / "frontend", ROOT / "images" / "art"]
    for target in legacy_image_roots:
        remove(target)

    # First-wave styles retain their AI PNG previews; only discard the small SVG drafts.
    svg_drafts = list((ROOT / "styles").glob("*/previews/*.svg"))
    for target in svg_drafts:
        target.unlink()

    # These catalogues exclusively described removed generic placeholder styles.
    for target in [
        ROOT / "data" / "frontend_styles.json",
        ROOT / "data" / "art_styles.json",
        ROOT / "data" / "style_combinations.json",
        ROOT / "data" / "style_master.csv",
        ROOT / "FRONTEND_STYLE_LIBRARY.md",
        ROOT / "ART_STYLE_LIBRARY.md",
        ROOT / "STYLE_COMBINATION_LIBRARY.md",
    ]:
        remove(target)

    source_path = ROOT / "sources" / "image_sources.json"
    sources = json.loads(source_path.read_text(encoding="utf-8"))
    filtered = {
        key: value for key, value in sources.items()
        if not (key.startswith("images/frontend/") or key.startswith("images/art/") or key.endswith(".svg") and key.startswith("styles/"))
    }
    source_path.write_text(json.dumps(filtered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # Flat export is a user-facing delivery folder: remove only the corresponding bad SVGs.
    flat = Path("preview_images_flat_2026-07-29")
    for target in flat.glob("*.svg"):
        target.unlink()

    print(f"removed_generic_style_families=104")
    print(f"removed_first_wave_svg_drafts={len(svg_drafts)}")
    print(f"remaining_source_records={len(filtered)}")

if __name__ == "__main__":
    main()
