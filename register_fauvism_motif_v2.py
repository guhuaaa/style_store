"""Record the restarted third-wave Fauvism motif's provenance."""
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

root = Path('design_style_library')
asset = root / 'styles' / 'fauvism' / 'assets' / 'fauvism_motif_v2.png'
if not asset.exists() or asset.stat().st_size < 100_000:
    raise SystemExit('Expected Fauvism motif is missing or unexpectedly small.')

manifest_path = root / 'sources' / 'image_sources.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
key = 'styles/fauvism/assets/fauvism_motif_v2.png'
manifest[key] = {
    'type': 'AI_GENERATED',
    'model': 'built-in image generation',
    'source_url': None,
    'source_page': None,
    'license': 'OpenAI-generated project research asset; verify product terms before external publication',
    'license_status': 'AI_GENERATED—PROJECT_RESEARCH_ASSET',
    'captured_at': datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds'),
    'original_file': r'C:\Users\86177\.codex\generated_images\019fa16a-7fc6-7cb0-ae54-3151479be1c7\exec-cf6b927d-0503-46a0-afde-bac1f5ce211b.png',
    'prompt_id': 'fauvism_motif_v2_short_recovery',
    'usage_scope': 'Local design research and visual reference only. Do not represent third-party historical material as an owned commercial asset.',
    'permission_status': 'AI_GENERATED—no third-party source image used',
    'generation_note': 'Restarted third-wave workflow: full UI attempt failed at network transport; 10-second backoff and stick-figure probe succeeded; shortened DNA motif prompt succeeded.'
}
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Registered {key} ({asset.stat().st_size} bytes).')
