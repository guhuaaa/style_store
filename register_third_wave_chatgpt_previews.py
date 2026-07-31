"""Register ChatGPT-web generated frontend previews for third-wave styles."""
from __future__ import annotations

import json
import struct
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path("design_style_library")
STYLES_ROOT = ROOT / "styles"
SOURCES = ROOT / "sources" / "image_sources.json"
REGISTRY = STYLES_ROOT / "ART_HISTORY_STYLE_THIRD_WAVE.json"
STATUS = ROOT / "THIRD_WAVE_GENERATION_STATUS.md"
SCRIPT = "tools/render_third_wave_chatgpt_previews.cjs"
CAPTURED = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")

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


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def png_size(path: Path) -> tuple[int, int]:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"{path} is not a PNG")
    return struct.unpack(">II", data[16:24])


def register_style(slug: str, sources: dict) -> str:
    style_path = STYLES_ROOT / slug / "style.json"
    preview = STYLES_ROOT / slug / "previews" / "medium_chatgpt_rendered.png"
    if not preview.exists():
        raise FileNotFoundError(preview)
    width, height = png_size(preview)
    if (width, height) != (1536, 1024):
        raise ValueError(f"{preview} has unexpected size {width}x{height}")
    if preview.stat().st_size < 20_000:
        raise ValueError(f"{preview} is unexpectedly small")

    key = f"styles/{slug}/previews/medium_chatgpt_rendered.png"
    style = read_json(style_path)
    previews = style.setdefault("previews", [])
    if key not in previews:
        previews.append(key)
    style["preview_status"] = "CHATGPT_WEB_FRONTEND_RENDER_PROVENANCE_RECORDED_CURATION_REVIEW_REQUIRED"
    style["generation_method"] = (
        "ChatGPT web generated a local Playwright renderer from Style DNA/UI constraints; "
        "project-authored HTML/CSS/SVG was captured as a 1536x1024 frontend preview; "
        "no third-party image input or remote asset was used."
    )
    attempts = style.setdefault("generation_attempts", [])
    prompt_id = f"{slug}_medium_chatgpt_frontend_v1"
    if not any(item.get("prompt_id") == prompt_id for item in attempts):
        attempts.append(
            {
                "level": "medium",
                "result": "SUCCESS",
                "captured_at": CAPTURED,
                "prompt_id": prompt_id,
                "renderer": SCRIPT,
                "output": key,
            }
        )
    write_json(style_path, style)

    sources[key] = {
        "type": "AI_ASSISTED_PROJECT_RENDER",
        "source_type": "CHATGPT_WEB_PROMPT_PLUS_PROJECT_AUTHORED_HTML_CSS_SVG",
        "source_url": None,
        "source_page": SCRIPT,
        "captured_at": CAPTURED,
        "license": "AI-assisted project-authored render; verify product terms before external publication",
        "license_status": "AI_ASSISTED_PROJECT_RESEARCH_ASSET",
        "permission_status": "PROJECT_ORIGINAL_NO_THIRD_PARTY_MATERIAL",
        "usage_scope": (
            "Local design research, visual retrieval, and UI-reference validation only. "
            "Do not represent third-party historical reference material as an owned commercial asset."
        ),
        "validation_status": "PENDING_CURATORIAL_AND_BLIND_VISUAL_TEST",
        "prompt_id": prompt_id,
        "dimensions": {"width": width, "height": height},
    }
    return key


def update_registry() -> None:
    registry = read_json(REGISTRY)
    for entry in registry.get("styles", []):
        style_path = STYLES_ROOT / entry["id"] / "style.json"
        if style_path.exists():
            entry["preview_status"] = read_json(style_path).get("preview_status", entry.get("preview_status"))
    write_json(REGISTRY, registry)


def update_status(registered: list[str]) -> None:
    lines = [
        "# Third-wave generation status",
        "",
        "## Verified generated previews",
        "",
        "- `arts_and_crafts` / `medium.png`: built-in image generation succeeded and is provenance-recorded.",
        "- `symbolism` / `medium_hybrid_rendered.png`: project-original hybrid preview succeeded.",
    ]
    for key in registered:
        slug = key.split("/")[1]
        lines.append(f"- `{slug}` / `medium_chatgpt_rendered.png`: ChatGPT-web frontend render succeeded and is provenance-recorded.")
    lines.extend(
        [
            "",
            "## Current service condition",
            "",
            "- The previous complex image-generation transport failure was bypassed with a local frontend-rendering workflow.",
            "- ChatGPT web generated the Playwright renderer from the third-wave Style DNA/UI constraints.",
            "- The final previews are local 1536x1024 HTML/CSS/SVG renders with no third-party image input.",
            "",
            "## Recovery protocol",
            "",
            "If direct image generation fails again, use the ChatGPT-web frontend-renderer path: generate local HTML/CSS/SVG, render via Playwright, then register provenance before curation.",
        ]
    )
    STATUS.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    sources = read_json(SOURCES) if SOURCES.exists() else {}
    registered = [register_style(slug, sources) for slug in SLUGS]
    write_json(SOURCES, sources)
    update_registry()
    update_status(registered)
    print(f"Registered {len(registered)} ChatGPT-web frontend previews.")


if __name__ == "__main__":
    main()
