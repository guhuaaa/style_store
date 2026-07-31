"""Sync third-wave ChatGPT preview renders into export and flat preview folders."""
from __future__ import annotations

import json
import shutil
from pathlib import Path


ROOT = Path("design_style_library")
EXPORT_ROOT = Path("preview_exports_2026-07-29")
FLAT_ROOT = Path("preview_images_flat_2026-07-29")
MANIFEST = EXPORT_ROOT / "manifest.json"

SLUGS = [
    "fauvism",
    "orphism",
    "vorticism",
    "precisionism",
    "abstract_expressionism",
    "color_field",
    "hard_edge",
    "op_art",
    "minimalism_art",
    "mexican_muralism",
]


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8-sig")) if MANIFEST.exists() else []
    seen = {(item.get("source"), item.get("exported")) for item in manifest}
    added = 0

    for slug in SLUGS:
        source = ROOT / "styles" / slug / "previews" / "medium_chatgpt_rendered.png"
        if not source.exists():
            raise FileNotFoundError(source)

        exported = EXPORT_ROOT / ROOT / "styles" / slug / "previews" / "medium_chatgpt_rendered.png"
        exported.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, exported)

        flat = FLAT_ROOT / f"art_history_{slug}_medium_chatgpt_rendered.png"
        flat.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, flat)

        source_key = str(source)
        exported_key = str(exported)
        if (source_key, exported_key) not in seen:
            manifest.append({"source": source_key, "exported": exported_key})
            added += 1

    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
    print(f"Synced {len(SLUGS)} previews; added {added} manifest entries.")


if __name__ == "__main__":
    main()
