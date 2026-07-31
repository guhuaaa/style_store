"""Register overview preview renders for every style."""
from __future__ import annotations

import json
import struct
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path("design_style_library")
STYLES_ROOT = ROOT / "styles"
SOURCES = ROOT / "sources" / "image_sources.json"
SCRIPT = "tools/render_all_style_overview_previews.cjs"
CAPTURED = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")
    return struct.unpack(">II", data[16:24])


def main() -> None:
    sources = read_json(SOURCES) if SOURCES.exists() else {}
    registered = []

    for style_dir in sorted(p for p in STYLES_ROOT.iterdir() if p.is_dir()):
        style_path = style_dir / "style.json"
        if not style_path.exists():
            continue
        preview = style_dir / "previews" / "overview_chatgpt_rendered.png"
        if not preview.exists():
            raise FileNotFoundError(preview)
        width, height = png_size(preview)
        if (width, height) != (1536, 1024):
            raise ValueError(f"{preview} has unexpected size {width}x{height}")
        if preview.stat().st_size < 20_000:
            raise ValueError(f"{preview} is unexpectedly small")

        style = read_json(style_path)
        slug = style["id"]
        key = f"styles/{slug}/previews/overview_chatgpt_rendered.png"
        previews = style.setdefault("previews", [])
        if key not in previews:
            previews.append(key)
        style["overview_preview_status"] = "PROJECT_ORIGINAL_FRONTEND_RENDER_PROVENANCE_RECORDED_CURATION_REVIEW_REQUIRED"
        style["overview_generation_method"] = (
            "Local Playwright overview renderer generated a 1536x1024 HTML/CSS/SVG style overview "
            "from recorded Style DNA; no remote assets or third-party image input were used."
        )
        attempts = style.setdefault("overview_generation_attempts", [])
        prompt_id = f"{slug}_overview_frontend_v1"
        if not any(item.get("prompt_id") == prompt_id for item in attempts):
            attempts.append(
                {
                    "result": "SUCCESS",
                    "captured_at": CAPTURED,
                    "prompt_id": prompt_id,
                    "renderer": SCRIPT,
                    "output": key,
                }
            )
        write_json(style_path, style)

        sources[key] = {
            "type": "PROJECT_ORIGINAL_RENDER",
            "source_type": "STYLE_DNA_BASED_HTML_CSS_SVG",
            "source_url": None,
            "source_page": SCRIPT,
            "captured_at": CAPTURED,
            "license": "CC0-1.0 (project-authored render)",
            "license_status": "CONFIRMED_PROJECT_ORIGINAL",
            "permission_status": "PROJECT_ORIGINAL_NO_THIRD_PARTY_MATERIAL",
            "usage_scope": "Local design research, visual retrieval, and UI-reference validation.",
            "validation_status": "PENDING_CURATORIAL_AND_BLIND_VISUAL_TEST",
            "prompt_id": prompt_id,
            "dimensions": {"width": width, "height": height},
        }
        registered.append(key)

    write_json(SOURCES, sources)
    print(f"Registered {len(registered)} overview previews.")


if __name__ == "__main__":
    main()
