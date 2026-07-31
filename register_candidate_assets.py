"""Record AI candidate assets, including rejected or pending replacement versions."""
from pathlib import Path
import hashlib, json
from datetime import datetime
ROOT=Path('design_style_library'); STYLES=ROOT/'styles'; GEN=Path(r'C:\Users\86177\.codex\generated_images\019fa16a-7fc6-7cb0-ae54-3151479be1c7')
def hash_file(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 generated={hash_file(p):str(p) for p in GEN.glob('*.png')}; sp=ROOT/'sources'/'image_sources.json'; sources=json.loads(sp.read_text(encoding='utf-8'))
 for img in STYLES.glob('*/previews/*_v2.png'):
  rel=img.relative_to(ROOT).as_posix(); sources[rel]={'type':'AI_GENERATED_CANDIDATE','model':'built-in image generation','source_url':None,'source_page':None,'captured_at':datetime.fromtimestamp(img.stat().st_mtime).astimezone().isoformat(timespec='seconds'),'original_file':generated.get(hash_file(img)),'license':'OpenAI-generated project asset; verify product terms before external publication','license_status':'AI_GENERATED—PROJECT_RESEARCH_ASSET','permission_status':'AI_GENERATED—no third-party source image used','usage_scope':'Local design research only; candidate requires visual curation before library inclusion.','validation_status':'PENDING_CURATORIAL_SELECTION'}
 sp.write_text(json.dumps(sources,ensure_ascii=False,indent=2),encoding='utf-8')
if __name__=='__main__': main()
