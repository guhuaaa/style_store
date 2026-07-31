"""Register a verified third-wave AI preview and the attempted-generation status."""
from __future__ import annotations

import json
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path("design_style_library")
STYLE = ROOT / "styles" / "arts_and_crafts" / "style.json"
PREVIEW = ROOT / "styles" / "arts_and_crafts" / "previews" / "medium.png"
SOURCES = ROOT / "sources" / "image_sources.json"
CAPTURED = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec="seconds")
KEY = "styles/arts_and_crafts/previews/medium.png"
ORIGINAL = r"C:\Users\86177\.codex\generated_images\019fa16a-7fc6-7cb0-ae54-3151479be1c7\exec-aad7a3a7-0ea4-4229-bab1-6d45f45df76d.png"

if not PREVIEW.exists() or PREVIEW.stat().st_size < 100_000:
    raise SystemExit("Verified Arts and Crafts preview is missing or unexpectedly small.")

data = json.loads(STYLE.read_text(encoding="utf-8"))
data["previews"] = [KEY]
data["preview_status"] = "AI_GENERATED—PROVENANCE_RECORDED—CURATION_REVIEW_REQUIRED"
data["generation_method"] = "Built-in image generation; medium-intensity DNA prompt; no third-party image input; copied into project after successful generation."
data["generation_attempts"] = [{"level": "medium", "result": "SUCCESS", "captured_at": CAPTURED, "original_file": ORIGINAL}]
STYLE.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

sources = json.loads(SOURCES.read_text(encoding="utf-8")) if SOURCES.exists() else {}
sources[KEY] = {
    "type": "AI_GENERATED",
    "model": "built-in image generation",
    "source_url": None,
    "source_page": None,
    "license": "OpenAI-generated project research asset; verify product terms before external publication",
    "license_status": "AI_GENERATED—PROJECT_RESEARCH_ASSET",
    "captured_at": CAPTURED,
    "original_file": ORIGINAL,
    "prompt_id": "arts_and_crafts_medium_v1",
    "prompt": "Elegant Arts and Crafts UI concept for a research and knowledge dashboard; original UI illustration; truthful material-led structure, handmade repeat rhythm, integrated border system, botanical and vernacular geometry, muted natural pigments; no third-party artwork.",
    "usage_scope": "Local design research, visual retrieval, and UI-reference validation only. Do not represent third-party historical reference material as an owned commercial asset.",
    "permission_status": "AI_GENERATED—no third-party source image used",
    "validation_status": "CURATION_REVIEW_REQUIRED"
}
SOURCES.write_text(json.dumps(sources, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

(ROOT / "THIRD_WAVE_GENERATION_STATUS.md").write_text("""# Third-wave generation status

## Verified generated preview

- `arts_and_crafts` / `medium.png`: built-in image generation succeeded and is provenance-recorded.

## Current service condition

- Small stick-figure probes succeed.
- Complex UI generations for `symbolism` and `fauvism` repeatedly failed with a transport-layer network error after long server-side processing.
- They remain `GENERATION_PENDING`; no failed or placeholder output was written.

## Recovery protocol

After a complex-generation network failure: wait 10 seconds, generate a small stick-figure probe, and only if it succeeds retry the formal preview using a shorter prompt.
""", encoding="utf-8")

print(f"Registered {KEY} ({PREVIEW.stat().st_size} bytes).")
