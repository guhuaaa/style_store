"""Register generated second-wave previews without touching existing wave status."""
from __future__ import annotations

import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path("design_style_library")
REGISTRY = ROOT / "styles" / "ART_HISTORY_STYLE_SECOND_WAVE.json"
SOURCES = ROOT / "sources" / "image_sources.json"
GENERATED = Path(r"C:\Users\86177\.codex\generated_images\019fa16a-7fc6-7cb0-ae54-3151479be1c7")

def main() -> None:
    entries = json.loads(REGISTRY.read_text(encoding="utf-8"))["styles"]
    source_data = json.loads(SOURCES.read_text(encoding="utf-8"))
    image_files = sorted(GENERATED.glob("*.png"), key=lambda p: p.stat().st_mtime)
    generated_now = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
    registered = 0
    for entry in entries:
        slug = entry["id"]
        folder = ROOT / "styles" / slug
        previews = []
        for level in ("low", "medium", "high"):
            candidates = [(folder / "previews" / f"{level}_rendered.png", "PROJECT_ORIGINAL_RENDER"),
                          (folder / "previews" / f"{level}.png", "AI_GENERATED")]
            for local, asset_type in candidates:
                if not local.exists():
                    continue
                key = local.relative_to(ROOT).as_posix()
                previews.append(f"styles/{slug}/previews/{local.name}")
                if key in source_data:
                    continue
                if asset_type == "PROJECT_ORIGINAL_RENDER":
                    source_data[key] = {
                        "type": "PROJECT_ORIGINAL_RENDER",
                        "source_type": "PROJECT_AUTHORED_HTML_CSS_SVG",
                        "source_url": None,
                        "source_page": "tools/render_second_wave_previews.cjs",
                        "captured_at": generated_now,
                        "license": "CC0-1.0 (project-authored render)",
                        "license_status": "CONFIRMED_PROJECT_ORIGINAL",
                        "permission_status": "PROJECT_ORIGINAL—no third-party material",
                        "usage_scope": "Local design research and visual reference; no third-party material is being published as a commercial asset.",
                        "validation_status": "PENDING_CURATORIAL_AND_BLIND_VISUAL_TEST",
                    }
                else:
                    # A copied output has no embedded remote provenance. Record the closest
                    # generated file by modification time as an auditable local origin.
                    origin = min(image_files, key=lambda p: abs(p.stat().st_mtime - local.stat().st_mtime)) if image_files else None
                    source_data[key] = {
                        "type": "AI_GENERATED", "model": "built-in image generation", "source_url": None,
                        "source_page": None, "captured_at": generated_now, "original_file": str(origin) if origin else None,
                        "license": "OpenAI-generated project asset; verify product terms before external publication",
                        "license_status": "AI_GENERATED—PROJECT_RESEARCH_ASSET", "permission_status": "AI_GENERATED—no third-party source image used",
                        "usage_scope": "Local design research, visual retrieval and UI-reference validation only.",
                        "validation_status": "PENDING_CURATORIAL_AND_BLIND_VISUAL_TEST",
                    }
                registered += 1
        style_path = folder / "style.json"
        style = json.loads(style_path.read_text(encoding="utf-8"))
        style["previews"] = previews
        style["preview_status"] = "PARTIAL_AI_GENERATION—PROVENANCE_RECORDED" if previews else "GENERATION_PENDING"
        style_path.write_text(json.dumps(style, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    SOURCES.write_text(json.dumps(source_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"registered={registered}")

if __name__ == "__main__":
    main()
