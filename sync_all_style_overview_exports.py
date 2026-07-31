"""Sync all overview preview renders into export and flat preview folders."""
from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path("design_style_library")
STYLES_ROOT = ROOT / "styles"
EXPORT_ROOT = Path("preview_exports_2026-07-29")
FLAT_ROOT = Path("preview_images_flat_2026-07-29")
MANIFEST = EXPORT_ROOT / "manifest.json"


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8-sig")) if MANIFEST.exists() else []
    seen = {(item.get("source"), item.get("exported")) for item in manifest}
    synced = 0
    added = 0

    for style_dir in sorted(p for p in STYLES_ROOT.iterdir() if p.is_dir()):
        style_path = style_dir / "style.json"
        source = style_dir / "previews" / "overview_chatgpt_rendered.png"
        if not style_path.exists() or not source.exists():
            continue
        style = json.loads(style_path.read_text(encoding="utf-8-sig"))
        slug = style["id"]

        exported = EXPORT_ROOT / ROOT / "styles" / slug / "previews" / "overview_chatgpt_rendered.png"
        exported.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, exported)

        flat = FLAT_ROOT / f"art_history_{slug}_overview_chatgpt_rendered.png"
        flat.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, flat)

        source_key = str(source)
        exported_key = str(exported)
        if (source_key, exported_key) not in seen:
            manifest.append({"source": source_key, "exported": exported_key})
            added += 1
        synced += 1

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
    print(f"Synced {synced} overview previews; added {added} manifest entries.")


if __name__ == "__main__":
    main()
