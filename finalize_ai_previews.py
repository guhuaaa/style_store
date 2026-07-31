"""Register project-bound AI previews with provenance and validation-ready metadata."""
from pathlib import Path
from datetime import datetime
import hashlib, json

ROOT=Path('design_style_library'); STYLES=ROOT/'styles'; GEN=Path(r'C:\Users\86177\.codex\generated_images\019fa16a-7fc6-7cb0-ae54-3151479be1c7')
def digest(p):
 h=hashlib.sha256(); h.update(p.read_bytes()); return h.hexdigest()
def main():
 generated={digest(p):p for p in GEN.glob('*.png')}
 sources_path=ROOT/'sources'/'image_sources.json'; sources=json.loads(sources_path.read_text(encoding='utf-8'))
 registry=[]
 for style_dir in sorted(p for p in STYLES.iterdir() if p.is_dir()):
  meta_path=style_dir/'style.json'
  if not meta_path.exists(): continue
  meta=json.loads(meta_path.read_text(encoding='utf-8')); previews=[]
  for level in ('low','medium','high'):
   img=style_dir/'previews'/f'{level}.png'; rel=img.relative_to(ROOT).as_posix(); source=generated.get(digest(img))
   record={'type':'AI_GENERATED','model':'built-in image generation','source_url':None,'source_page':None,'license':'OpenAI-generated project asset; verify product terms before external publication','license_status':'AI_GENERATED—PROJECT_RESEARCH_ASSET','captured_at':datetime.fromtimestamp(img.stat().st_mtime).astimezone().isoformat(timespec='seconds'),'original_file':str(source) if source else None,'prompt_file':'generation_prompts.md','prompt_id':f'{meta["id"]}_{level}','usage_scope':'Local design research, visual retrieval and UI-reference validation. Do not represent third-party historical reference material as owned commercial asset.','permission_status':'AI_GENERATED—no third-party source image used','validation_status':'PENDING_BLIND_VISUAL_TEST'}
   sources[rel]=record; previews.append(rel)
  meta['previews']=previews; meta['preview_status']='AI_GENERATED—PROVENANCE_RECORDED—BLIND_TEST_REQUIRED'; meta['generation_method']='Short DNA prompt; single style and single intensity; copied into project immediately after successful generation.'
  meta_path.write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8'); registry.append(meta)
 (STYLES/'ART_HISTORY_STYLE_FIRST_WAVE.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2),encoding='utf-8')
 sources_path.write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
 prompts='''# Generation Prompt Protocol

All final previews use the same fixed Analytics / Knowledge Dashboard benchmark. Each request is intentionally short to reduce backend timeouts and is generated one style × one intensity at a time.

## Shared constraints

`16:10 front-facing flat desktop UI; abstract charts/table/KPI/filter/status; no readable text; no people; no device mockup; no watermark.`

## DNA prompt rule

Use each style's `STYLE_DNA.md` CORE rules to specify composition, shape, color logic and rhythm. LOW keeps product structure with restrained DNA; MEDIUM changes layout and components; HIGH lets the DNA dominate composition while preserving dashboard affordances. Do not prompt only with a historical style name.

## Pairwise differentiation gate

Before generation, include the candidate's **required structural signature** and its nearest-neighbor **negative constraints**. After generation, hide all labels and reject an asset unless it has at least three visible structural discriminators from every nearest neighbor.

| Style | Required signature | Veto / nearest-neighbor exclusion |
|---|---|---|
| Bauhaus | asymmetric functional geometry; at least one circle and one non-orthogonal directional relationship; color assigned to task role | Reject a regular Mondrian-like black grid, all-rectangle pane matrix, decorative halftone or comic contour. |
| De Stijl | orthogonal black-rule composition; large white field; only a few primary rectangular planes; asymmetry through proportion | Reject circles, diagonal axes, gradients, halftone, speech-bubble panels, dense multi-color chart decoration. |
| Pop Art | thick comic contour; Ben-Day/halftone field; crop/scale jump; repeated commercial-symbol rhythm; irregular comic framing | Reject a clean geometric primary-color grid, restrained functional color coding, or a Mondrian-like rectangle composition. |

## Curation priority

Pairwise distinction is a **selection criterion**, not a command to exaggerate a style. Preserve compositional grace, information hierarchy, restraint and product usability first. When two candidates remain too close, retain the more elegant and historically coherent result and discard the weaker candidate; do not add arbitrary decoration or visual noise merely to force separation.

## Generated asset policy

Images are stored locally as research previews. Historic references remain separately recorded as museum/institution pages; these generated previews do not contain downloaded third-party reference images.
'''
 (STYLES/'generation_prompts.md').write_text(prompts,encoding='utf-8')
if __name__=='__main__': main()
