"""Invalidate visually confusable previews and record preventive generation gates."""
from pathlib import Path
import json

ROOT=Path('design_style_library'); STYLES=ROOT/'styles'; TARGETS={'bauhaus','de_stijl','pop_art'}
def main():
 src_path=ROOT/'sources'/'image_sources.json'; src=json.loads(src_path.read_text(encoding='utf-8'))
 report=['# Pairwise Differentiation Audit','','## Finding','','The attached label-hidden comparison exposed a shared fallback grammar: primary-color blocks, regular pane grids, chart cards and flat dashboard composition. That makes Bauhaus, De Stijl and Pop Art visually confusable despite different labels.','', '## Root causes','','1. **Shared benchmark overrode style structure.** The fixed dashboard content was mapped to the same equal-weight card grid.','2. **Palette was mistaken for structure.** Red, blue and yellow appeared in all three without distinct functional logic.','3. **Nearest-neighbor exclusions were absent.** Prompts stated what to add but not what each style must not resemble.','4. **Validation measured individual fidelity only.** A high single-style score did not test whether a nearby style could be mistaken for it.','','## Mandatory future gate','','A candidate must expose at least three style-specific structural discriminators when its name, description, keywords and color names are hidden. It is compared directly against its nearest neighbors before it can receive `STYLE_TRANSLATION_COMPLETE`.','', '| Candidate | Must visibly show | Must not show | Status |','|---|---|---|---|']
 rules={
 'bauhaus':('functional asymmetry; circles plus directional geometry; color tied to task role','Mondrian-like full black grid, regular all-rectangle pane matrix, halftone/comic contour'),
 'de_stijl':('orthogonal black-rule order; large white voids; sparse primary rectangles; proportional asymmetry','circles, diagonal axes, gradients, dense multi-color charts, comic panels'),
 'pop_art':('thick comic contour; Ben-Day field; crop/scale jump; repeated commercial-symbol rhythm','clean geometric primary-color grid, restrained functional palette, Mondrian-like composition')}
 for slug in TARGETS:
  p=STYLES/slug/'style.json'; meta=json.loads(p.read_text(encoding='utf-8'))
  meta['preview_status']='PAIRWISE_REGEN_REQUIRED—CURRENT_MEDIUM_CONFOUNDED'
  meta['completion_flags']=[x for x in meta.get('completion_flags',[]) if x!='STYLE_TRANSLATION_COMPLETE' and x!='VISUAL_RECOGNITION_VALID']
  meta['pairwise_differentiation']={'nearest_neighbors':sorted(TARGETS-{slug}),'required_signature':rules[slug][0],'veto':rules[slug][1],'status':'FAIL—REGENERATE_WITH_GUARDRAILS'}
  p.write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
  for rel in meta['previews']:
   src[rel]['validation_status']='PAIRWISE_REGEN_REQUIRED'; src[rel]['pairwise_similarity_risk']='HIGH for current set; supersede after regenerated candidate passes pairwise blind test.'
  report.append(f'| {meta["name_en"]} | {rules[slug][0]} | {rules[slug][1]} | REGENERATE |')
 report += ['', '## Release rule','','Do not use the current previews of these three styles for retrieval, training reference, or a claim of successful style translation. Regenerate LOW/MEDIUM/HIGH using `styles/generation_prompts.md`, then rerun an 8-way and nearest-neighbor blind test.']
 (ROOT/'reports'/'PAIRWISE_DIFFERENTIATION_AUDIT.md').write_text('\n'.join(report)+'\n',encoding='utf-8')
 registry=[]
 for p in sorted(x/'style.json' for x in STYLES.iterdir() if x.is_dir() and (x/'style.json').exists()):
  registry.append(json.loads(p.read_text(encoding='utf-8')))
 (STYLES/'ART_HISTORY_STYLE_FIRST_WAVE.json').write_text(json.dumps(registry,ensure_ascii=False,indent=2),encoding='utf-8')
 src_path.write_text(json.dumps(src,ensure_ascii=False,indent=2),encoding='utf-8')
 # Correct the earlier aggregate completion claim.
 status=ROOT/'reports'/'VISUAL_STYLE_REBUILD_STATUS.md'
 status.write_text('''# Visual Style Rebuild Status\n\n## First wave status\n\n- 24 AI previews were generated with provenance.\n- Art Nouveau, Art Deco, Constructivism, Surrealism and Ukiyo-e retain their individual first-wave validation.\n- **Bauhaus, De Stijl and Pop Art are under pairwise regeneration.** Their current previews are structurally confusable in label-hidden comparison and are excluded from completion claims.\n- Generic legacy SVG art previews remain `PLACEHOLDER_PREVIEW` and are excluded from retrieval, fidelity validation and training reference use.\n\nSee `PAIRWISE_DIFFERENTIATION_AUDIT.md` for the root cause and mandatory generation gate.\n''',encoding='utf-8')
if __name__=='__main__': main()
