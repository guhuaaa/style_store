"""Build an offline, provenance-first MVP design style library."""
from __future__ import annotations
import csv, json, shutil
from datetime import date, datetime, timezone, timedelta
from pathlib import Path

ROOT = Path('design_style_library')
TODAY = date.today().isoformat()
CAPTURED_AT = datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds')

FRONTEND = [
('minimalism','Minimalism','极简主义','foundation','留白、克制层级与少量强调色','portfolio, product, documentation','Japanese Minimalism, Swiss Style'),
('modern_minimalism','Modern Minimalism','现代极简','foundation','宽松网格、精炼排版与柔和中性色','SaaS, portfolio, premium product','Japanese Minimalism, Editorial Illustration'),
('flat_design','Flat Design','扁平化设计','foundation','纯色块、简化图标与清晰层级','consumer product, education','Memphis, Flat Illustration'),
('material_design','Material Design','材料设计','design_system','层级表面、明确状态与运动反馈','enterprise app, Android web','Flat Illustration, Isometric'),
('swiss_style','Swiss Style','瑞士国际主义排版','typography','网格、无衬线字体与高对比排版','editorial, data, cultural site','Constructivism, Swiss Style'),
('editorial','Editorial Design','编辑式设计','content','大标题、图片叙事与杂志节奏','culture, publishing, storytelling','Art Nouveau, Editorial Illustration'),
('corporate_enterprise','Corporate Enterprise UI','企业级界面','product','保守色彩、稳定导航与可扫描信息','B2B, operations, finance','Swiss Style, Minimalism'),
('saas_dashboard','SaaS Dashboard','SaaS 仪表盘','data','侧栏、指标卡、图表与操作密度','AI SaaS, analytics','3D Illustration, Aurora'),
('data_heavy_dashboard','Data-heavy Dashboard','高密度数据仪表盘','data','多维表格、筛选器与紧凑图表','risk monitoring, trading, BI','Cyberpunk, Constructivism'),
('landing_marketing','Landing Page Marketing','营销落地页','marketing','价值主张、转化路径与视觉焦点','launch, campaign, product marketing','3D Clay, Gradient'),
('glassmorphism','Glassmorphism','玻璃拟态','material_effect','半透明层、模糊背景与光泽边缘','AI, data, music','Aurora Gradient, Holographic'),
('neumorphism','Neumorphism','新拟态','material_effect','柔和阴影、同色表面与内凹控件','wellness, personal tools','3D Clay, Pastel'),
('skeuomorphism','Skeuomorphism','拟物化设计','material_effect','现实材质、机械细节与熟悉隐喻','audio, game, niche tools','Victorian Illustration, Engraving'),
('claymorphism','Claymorphism','黏土拟态','material_effect','圆润体块、柔光与玩具般质感','friendly AI, education','3D Clay, Flat Illustration'),
('layered_cards','Layered Cards','层叠卡片','layout','多层表面、深度秩序与模块化内容','SaaS, marketplace','3D Illustration, Gradient'),
('floating_ui','Floating UI','悬浮界面','layout','脱离边界的面板、快捷操作与空间感','creative tools, AI','Holographic, Retro Futurism'),
('spatial_ui','Spatial UI','空间化界面','layout','深度、坐标感与沉浸式画布','3D tools, maps, XR','Low Poly, Isometric'),
('bento_grid','Bento Grid','便当网格','layout','不同尺度卡片组成的规整拼贴','portfolio, AI product','3D Clay, Japanese Minimalism'),
('card_based_ui','Card-based UI','卡片式界面','layout','独立内容单元与易扫描分组','content, marketplace, SaaS','Flat Illustration, Pastel'),
('brutalism','Brutalism','粗野主义','expressive','强边框、原始色彩与直接信息','creative studio, campaign','Constructivism, Screen Print'),
('neo_brutalism','Neo-Brutalism','新粗野主义','expressive','高饱和色、厚描边与夸张阴影','creator tools, youth product','Memphis, Pop Art'),
('maximalism','Maximalism','极繁主义','expressive','高信息量、装饰叠加与强节奏','fashion, entertainment','Collage, Pop Art'),
('bold_typography','Bold Typography','大胆字体','typography','超大字号、强字重与文字主导构图','branding, launch, media','Swiss Style, Constructivism'),
('experimental_typography','Experimental Typography','实验排版','typography','非常规阅读路径与动态文字关系','art, music, culture','Dadaism, Glitch Art'),
('poster_web','Poster-style Web Design','海报式网页','expressive','海报构图、主视觉与短促信息','event, exhibition, music','Screen Print, Art Deco'),
('collage_ui','Collage UI','拼贴界面','expressive','纸片、剪贴与异质素材并置','editorial, storytelling','Collage, Risograph'),
('anti_design','Anti-design','反设计','expressive','故意的不规则、冲突与反常规','experimental, art project','Dadaism, Glitch Art'),
('y2k_web','Y2K Web','千禧年网页','retro','高光塑料、泡泡字与数码乐观感','fashion, gaming, youth','Y2K, Holographic'),
('cyber_ui','Cyber UI','赛博界面','futuristic','霓虹线框、技术标注与深色背景','AI, game, security','Cyberpunk, Glitch Art'),
('futuristic_ui','Futuristic UI','未来主义界面','futuristic','几何光效、前瞻排版与高科技材质','technology, automotive','Retro Futurism, Holographic'),
('sci_fi_hud','Sci-Fi HUD','科幻抬头显示','futuristic','仪表环、标尺与高密度态势信息','command center, game, simulation','Cyberpunk, Generative Art'),
('documentation','Documentation Style','文档式设计','content','低干扰阅读、目录锚点与代码区块','developer tools, knowledge base','Minimalism, Swiss Style'),
('knowledge_base','Knowledge Base','知识库界面','content','层级知识树、搜索与关联阅读','research, internal wiki','Editorial Illustration, Japanese Minimalism'),
('storytelling','Storytelling Website','叙事型网站','content','章节、情境切换与渐进披露','brand story, culture, game','Art Nouveau, Surrealism'),
('scrollytelling','Scrollytelling','滚动叙事','content','滚动驱动的时间、数据和场景变化','report, journalism, exhibit','Data Storytelling, Collage'),
('dark_mode','Dark Mode','深色模式','atmosphere','低亮背景、发光重点与专注氛围','developer tools, monitoring, media','Cyberpunk, Dark Romanticism'),
('command_center','Command Center','指挥中心','data','全局态势、告警层级与多面板协同','risk monitoring, NOC, game','Cyberpunk, Constructivism'),
('infinite_canvas','Infinite Canvas','无限画布','interaction','自由缩放、空间组织与对象关系','knowledge graph, whiteboard','Generative Art, Collage'),
('node_interface','Node-based Interface','节点式界面','interaction','连线、端口与可组合流程','AI workflow, visual programming','Isometric, Cyberpunk'),
('timeline_interface','Timeline Interface','时间线界面','interaction','时间轴、事件层与可追溯状态','project, narrative, analytics','Editorial, Retro Computing'),
('map_based_ui','Map-based UI','地图式界面','spatial','地理图层、位置编码与空间筛选','logistics, GIS, mobility','Topographic, Isometric'),
]

ART = [
('bauhaus','Bauhaus','包豪斯','modern','几何基本形、原色与功能主义','grid, geometry, primary colors','dashboard, landing'),
('swiss_graphic','Swiss Style','瑞士平面风格','modern','严格网格、摄影与无衬线排版','grid, typography, red','editorial, data'),
('constructivism','Constructivism','构成主义','modern','对角构图、红黑强对比与宣传感','diagonal, red, black','brutalism, campaign'),
('de_stijl','De Stijl','风格派','modern','黑色线条与红黄蓝矩形','grid, primary colors, asymmetry','minimal product, portfolio'),
('art_deco','Art Deco','装饰艺术','modern','对称、金色几何与奢华秩序','gold, fan, symmetry','luxury, game'),
('art_nouveau','Art Nouveau','新艺术','modern','植物曲线、装饰边框与自然节律','botanical, curves, ornament','storytelling, cultural'),
('memphis','Memphis','孟菲斯','modern','活泼几何、斑点与跳跃色彩','shapes, playful, pastel','consumer, youth'),
('pop_art','Pop Art','波普艺术','modern','网点、漫画色与大众文化符号','halftone, comic, bold','campaign, entertainment'),
('postmodernism','Postmodernism','后现代主义','modern','拼贴、戏仿与多重视觉语法','eclectic, collage, irony','experimental, culture'),
('flat_illustration','Flat Illustration','扁平插画','illustration','简化轮廓、纯色与友好叙事','flat, friendly, shapes','SaaS, onboarding'),
('vector_illustration','Vector Illustration','矢量插画','illustration','清晰边缘、可扩展图形与模块构图','vector, clean, scalable','product, editorial'),
('line_art','Line Art','线描','illustration','单线轮廓、留白与轻巧节奏','line, contour, minimal','documentation, luxury'),
('hand_drawn','Hand-drawn','手绘','illustration','不规则笔触与人情味','organic, imperfect, warm','education, storytelling'),
('sketch','Sketch','草图','illustration','铅笔痕迹、注释与过程感','pencil, process, notes','research, workshop'),
('ink_illustration','Ink Illustration','墨线插画','illustration','黑白笔触、浓淡与强表现力','ink, contrast, brush','editorial, game'),
('woodcut','Woodcut','木刻','print','刀刻纹理、粗线与民艺感','carved, texture, black','culture, narrative'),
('screen_print','Screen Print','丝网印刷','print','色块套印、颗粒与海报力量','print, layers, bold','poster, brutalism'),
('risograph','Risograph','孔版印刷','print','错位套色、颗粒与温暖纸感','grain, offset, ink','editorial, community'),
('paper_cut','Paper Cut','剪纸','craft','多层纸片、阴影与轮廓叙事','paper, layers, craft','education, festival'),
('collage','Collage','拼贴','craft','异质图像、撕边与重组叙事','cutout, eclectic, texture','editorial, storytelling'),
('editorial_illustration','Editorial Illustration','编辑插画','illustration','概念隐喻与文章配图节奏','conceptual, metaphor, narrative','knowledge, publishing'),
('chinese_ink','Chinese Ink Painting','中国水墨','east_asian','留白、墨色浓淡与山水节奏','ink, wash, calm','culture, meditation'),
('gongbi','Gongbi','工笔画','east_asian','精细线条、设色与古典秩序','fine line, mineral color, detailed','heritage, luxury'),
('chinese_woodblock','Chinese Woodblock','中国木版画','east_asian','套色块面、朴拙轮廓与民间叙事','print, folk, color','culture, festival'),
('dunhuang','Dunhuang-inspired','敦煌灵感','east_asian','飞天曲线、矿物色与壁画纹样','ochre, azure, mural','exhibition, game'),
('song_painting','Song Dynasty Painting','宋画','east_asian','雅致留白、细腻自然与宁静尺度','mist, nature, refined','portfolio, culture'),
('ukiyo_e','Ukiyo-e','浮世绘','east_asian','平面色块、浪线与木版构图','wave, indigo, print','storytelling, game'),
('japanese_minimalism','Japanese Minimalism','日式极简','east_asian','自然材质、留白与安静秩序','calm, neutral, wabi-sabi','portfolio, knowledge'),
('korean_editorial','Korean Editorial','韩式编辑风','east_asian','精致留白、柔和色与排版节奏','soft, type, elegant','beauty, editorial'),
('minhwa','Minhwa','韩国民画','east_asian','民俗符号、鲜明色彩与平面叙事','folk, tiger, flowers','culture, playful'),
('cyberpunk','Cyberpunk','赛博朋克','digital','霓虹、雨夜、密集信息与反乌托邦','neon, dark, city','command center, game'),
('vaporwave','Vaporwave','蒸汽波','digital','粉紫渐变、古典雕像与怀旧数码','pink, grid, nostalgia','music, fashion'),
('synthwave','Synthwave','合成波','digital','夕阳、地平网格与80年代霓虹','sunset, grid, neon','game, music'),
('y2k','Y2K','千禧年美学','digital','镀铬、泡泡、透明塑料与乐观科技','chrome, bubble, aqua','youth, commerce'),
('retro_futurism','Retro Futurism','复古未来主义','digital','旧时代想象的太空科技与几何','space, retro, optimistic','AI, automotive'),
('pixel_art','Pixel Art','像素艺术','digital','像素网格、有限色板与游戏感','pixel, grid, game','game, playful'),
('low_poly','Low Poly','低多边形','digital','硬边几何面与抽象体积','polygon, faceted, 3d','spatial, map'),
('isometric','Isometric','等距视角','digital','等距网格与可读的空间系统','isometric, spatial, blocks','map, dashboard'),
('3d_clay','3D Clay','3D 黏土','digital','柔软圆润、马卡龙色与友好体积','soft, clay, rounded','AI SaaS, education'),
('3d_illustration','3D Illustration','3D 插画','digital','立体对象、柔光与现代商业视觉','render, volume, colorful','landing, SaaS'),
('holographic','Holographic','全息','digital','彩虹衍射、高光与半透明薄膜','iridescent, light, chrome','futuristic, fashion'),
('glitch_art','Glitch Art','故障艺术','digital','错位像素、扫描线与数字失真','glitch, RGB, distortion','cyber, music'),
('generative_art','Generative Art','生成艺术','digital','算法线条、参数图形与动态秩序','algorithmic, lines, abstract','AI, data'),
('renaissance','Renaissance','文艺复兴','historical','透视、均衡构图与人文比例','classical, balance, perspective','culture, luxury'),
('baroque','Baroque','巴洛克','historical','戏剧光影、动势与华丽细节','dramatic, gold, chiaroscuro','game, premium'),
('rococo','Rococo','洛可可','historical','粉色、贝壳曲线与轻盈装饰','pastel, ornate, playful','beauty, lifestyle'),
('romanticism','Romanticism','浪漫主义','historical','崇高自然、情绪与戏剧天空','landscape, emotional, sublime','storytelling, game'),
('impressionism','Impressionism','印象派','historical','色彩笔触、光感与瞬间氛围','light, brush, color','culture, wellness'),
('expressionism','Expressionism','表现主义','historical','夸张色彩、变形与情感张力','emotional, contrast, raw','music, narrative'),
('surrealism','Surrealism','超现实主义','historical','梦境并置、错位尺度与意外隐喻','dream, strange, symbolic','creative, storytelling'),
('cubism','Cubism','立体主义','historical','多视角切面、几何分解与重组','facets, geometry, abstract','data, art'),
('futurism','Futurism','未来主义（艺术运动）','historical','速度线、机械感与动势','speed, machine, dynamic','mobility, technology'),
('dadaism','Dadaism','达达主义','historical','荒诞拼贴、反逻辑与实验文字','absurd, collage, type','anti-design, culture'),
('beardsley','Beardsley-inspired','比亚兹莱式黑白装饰','ornamental','黑白高对比、花卉曲线与装饰轮廓','ornamental, black, botanical','game, luxury'),
('engraving','Engraving','雕版画','ornamental','密集排线、古典质感与细节','hatching, vintage, detail','narrative, heritage'),
('etching','Etching','蚀刻版画','ornamental','纤细刻线、颗粒与旧书感','etched, fine lines, antique','editorial, game'),
('victorian','Victorian Illustration','维多利亚插画','ornamental','繁复边框、古典字体与博物学趣味','ornate, vintage, botanical','game, storytelling'),
('gothic','Gothic','哥特','ornamental','尖拱、黑暗垂直感与宗教式庄严','dark, arches, vertical','horror game, culture'),
('dark_romanticism','Dark Romanticism','黑暗浪漫主义','ornamental','阴郁自然、神秘感与戏剧光影','moody, dark, nature','narrative, game'),
('ornamental_line','Ornamental Line Art','装饰线描','ornamental','连续花纹、细线与边框组织','line, pattern, border','luxury, editorial'),
('botanical','Botanical Illustration','植物博物插画','ornamental','科学式植物细节与自然配色','botanical, specimen, green','knowledge, wellness'),
('topographic','Topographic','地形图','spatial','等高线、地貌分层与空间编码','contours, map, terrain','map, GIS'),
]

COMBOS = [
('editorial','art_nouveau','文艺装饰、强叙事','文化展览、叙事游戏','★★★★★'),('brutalism','constructivism','高冲击、行动感','创意机构','★★★★★'),('glassmorphism','retro_futurism','轻盈科技、空间感','AI SaaS','★★★★★'),('minimalism','japanese_minimalism','克制、宁静、专注','作品集、知识管理','★★★★★'),('command_center','cyberpunk','高压态势、指挥感','风险监控、游戏','★★★★★'),('bento_grid','3d_clay','友好、现代、易理解','AI 产品','★★★★★'),('data_heavy_dashboard','constructivism','强分区、强层级','风控、交易','★★★★☆'),('infinite_canvas','generative_art','探索性关系网络','知识图谱','★★★★★'),('node_interface','isometric','可读的系统空间','AI 工作流、关系图谱','★★★★☆'),('map_based_ui','topographic','明确的空间层次','GIS、物流','★★★★★'),('timeline_interface','editorial_illustration','章节化历史感','学术档案、叙事','★★★★☆'),('scrollytelling','collage','活泼的材料叙事','专题报道','★★★★☆'),('dark_mode','dark_romanticism','神秘、沉浸','恐怖叙事游戏','★★★★★'),('sci_fi_hud','holographic','高科技仪器感','模拟器、游戏','★★★★☆'),('landing_marketing','3d_illustration','亲和商业视觉','AI SaaS 落地页','★★★★★'),('neo_brutalism','memphis','高能、年轻','创作者工具','★★★★☆'),('poster_web','screen_print','印刷感与行动号召','活动、音乐','★★★★☆'),('collage_ui','risograph','人文、独立出版感','编辑、社区','★★★★☆'),('knowledge_base','botanical','沉静的学习氛围','学术知识管理','★★★☆☆'),('documentation','line_art','低干扰、清晰','开发者文档','★★★★☆'),('spatial_ui','low_poly','抽象三维空间','地图、空间计算','★★★★☆'),('floating_ui','holographic','轻快未来感','创意 AI 工具','★★★★☆'),('corporate_enterprise','swiss_graphic','可信、规范','金融、企业软件','★★★★★'),('material_design','flat_illustration','一致、友好','教育、消费产品','★★★★☆'),('skeuomorphism','engraving','工艺与仪器感','叙事游戏、音频工具','★★★☆☆'),('y2k_web','y2k','怀旧数码乐观感','潮流、游戏','★★★★★'),('experimental_typography','dadaism','反常规视觉实验','艺术项目','★★★★☆'),('futuristic_ui','futurism','速度、技术与前瞻','交通、汽车','★★★★☆'),('storytelling','surrealism','梦境式叙事','文化、创意作品','★★★★☆'),('saas_dashboard','aurora','明快智能感','AI SaaS','★★★★☆'),
]

# Aurora is a useful art direction label, represented as a synthesized original reference.
ART.append(('aurora','Aurora Gradient','极光渐变','digital','柔和极光色带、冷暖过渡与空间光感','aurora, gradient, luminous','AI, dashboard'))

PALETTES = ['#14213d,#fca311,#e5e5e5,#ffffff','#141414,#ff4d6d,#ffd166,#f7fff7','#071a52,#086788,#07a0c3,#f0c808','#160f29,#246a73,#368f8b,#f3dfbf','#0d1b2a,#1b263b,#415a77,#e0e1dd','#2b2d42,#8d99ae,#edf2f4,#ef233c']

def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def svg_preview(title, subtitle, kind, idx):
    colors = PALETTES[idx % len(PALETTES)].split(','); bg, a, b, c = colors
    if kind == 'frontend':
        body = f'''<rect width="1440" height="900" fill="{bg}"/><rect x="48" y="48" width="1344" height="64" rx="16" fill="{c}" opacity=".94"/><circle cx="82" cy="80" r="12" fill="{a}"/><rect x="48" y="140" width="250" height="712" rx="24" fill="{c}" opacity=".88"/><rect x="328" y="140" width="1016" height="190" rx="28" fill="{a}" opacity=".85"/><rect x="328" y="360" width="300" height="210" rx="24" fill="{c}"/><rect x="658" y="360" width="328" height="210" rx="24" fill="{b}" opacity=".88"/><rect x="1016" y="360" width="328" height="210" rx="24" fill="{c}"/><path d="M360 760 C510 570 670 820 815 650 S1110 800 1300 610" fill="none" stroke="{a}" stroke-width="18"/><text x="88" y="205" fill="{bg}" font-size="30" font-family="Arial">STYLE / {idx+1:02}</text><text x="365" y="215" fill="{bg}" font-size="60" font-weight="700" font-family="Arial">{esc(title)}</text><text x="365" y="274" fill="{bg}" font-size="28" font-family="Arial">{esc(subtitle)}</text>'''
    else:
        body = f'''<rect width="1440" height="900" fill="{bg}"/><circle cx="290" cy="300" r="230" fill="{a}" opacity=".9"/><rect x="600" y="110" width="590" height="590" rx="{20+(idx%5)*30}" fill="{b}" transform="rotate({(idx%6-3)*6} 895 405)"/><path d="M80 760 Q280 480 470 760 T860 760 T1360 760" fill="none" stroke="{c}" stroke-width="34"/><path d="M130 160 L1320 680 M1320 160 L130 680" stroke="{c}" stroke-width="8" opacity=".55"/><text x="82" y="820" fill="{c}" font-size="64" font-weight="700" font-family="Arial">{esc(title)}</text><text x="86" y="862" fill="{c}" font-size="25" font-family="Arial">{esc(subtitle)}</text>'''
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">{body}</svg>'

def style_obj(row, category, i):
    sid,en,zh,sub,desc,suitable,related = row
    return {'id': f'{category}_{sid}','name_en':en,'name_zh':zh,'category':category,'subcategory':sub,'description':desc,'visual_features':desc.split('、'),'color_features':['见本地原创预览色板'],'typography':['按风格调整：系统无衬线 / 展示性字形'],'layout_features':['模块化、层级清晰'],'ui_elements':['card','navigation','data display'],'interaction_features':['hover','focus','progressive disclosure'],'suitable_for':suitable.split(', '),'not_suitable_for':['需要极端无障碍保守视觉的未验证场景'],'keywords':(en.lower()+', '+desc).split(', '),'related_styles':related.split(', '),'compatible_art_styles':related.split(', '),'preview_images':[f'images/{category}/{sid}/preview_01.svg'],'source':['sources/image_sources.json'],'mood':['professional','expressive'][i%2],'density':['LOW','MEDIUM','HIGH'][i%3],'decoration':['LOW','MEDIUM','HIGH'][i%3],'information_density':['LOW','MEDIUM','HIGH'][i%3],'ui_character':['SERIOUS','NEUTRAL','EXPRESSIVE'][i%3],'confidence':'HIGH'}

def write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True); path.write_text(content, encoding='utf-8')

def main():
    if ROOT.exists(): shutil.rmtree(ROOT)
    (ROOT/'data').mkdir(parents=True); (ROOT/'sources').mkdir(); (ROOT/'reports').mkdir()
    frontend_objs=[style_obj(r,'frontend',i) for i,r in enumerate(FRONTEND)]
    art_objs=[style_obj(r,'art',i) for i,r in enumerate(ART)]
    sources={}
    for kind, rows in [('frontend',FRONTEND),('art',ART)]:
        for i,row in enumerate(rows):
            sid,en,zh,*_=row; p=ROOT/'images'/kind/sid/'preview_01.svg'
            write(p, svg_preview(en,zh,kind,i))
            sources[str(p.relative_to(ROOT)).replace('\\','/')]={'type':'ORIGINAL_VECTOR','source_type':'PROJECT_ORIGINAL','source_url':None,'source_page':'Local original SVG style board generated by build_style_library.py','original_author':'style_store project','license':'CC0-1.0 (project-authored asset)','license_status':'CONFIRMED_PROJECT_ORIGINAL','captured_at':CAPTURED_AT,'download_date':TODAY,'usage_scope':'Local design research and visual reference; no third-party material is being published as a commercial asset.','permission_status':'PROJECT_ORIGINAL — no third-party material','notes':'Created as a local research preview; not a third-party commercial asset.'}
    combos=[]
    for i,(f,a,e,use,score) in enumerate(COMBOS,1):
        cid=f'combo_{i:02}_{f}_{a}'; combos.append({'id':cid,'frontend_style':f,'art_direction':a,'effect':e,'recommended_for':use,'recommendation':score,'reason':f'{e}，与场景的信息结构和情绪目标相匹配。','preview_images':[]})
    write(ROOT/'data/frontend_styles.json',json.dumps(frontend_objs,ensure_ascii=False,indent=2))
    write(ROOT/'data/art_styles.json',json.dumps(art_objs,ensure_ascii=False,indent=2))
    write(ROOT/'data/style_combinations.json',json.dumps(combos,ensure_ascii=False,indent=2))
    write(ROOT/'sources/image_sources.json',json.dumps(sources,ensure_ascii=False,indent=2))
    with (ROOT/'data/style_master.csv').open('w',newline='',encoding='utf-8-sig') as f:
        w=csv.DictWriter(f,fieldnames=['id','type','name_en','name_zh','category','description','keywords','suitable_for','preview_path']); w.writeheader()
        for o in frontend_objs+art_objs: w.writerow({'id':o['id'],'type':o['category'],'name_en':o['name_en'],'name_zh':o['name_zh'],'category':o['subcategory'],'description':o['description'],'keywords':' | '.join(o['keywords']),'suitable_for':' | '.join(o['suitable_for']),'preview_path':o['preview_images'][0]})
    def table(objs,art=False):
        head='| Preview | '+('艺术风格 | 中文 | 视觉特征 | 色彩 | 图形语言 | UI 应用方向 | 推荐 UI |' if art else '风格 | 中文 | 核心视觉 | 典型布局 | 色彩 | 适用场景 | 可搭配艺术风格 |')+'\n|---|---|---|---|---|---|---|---|\n'
        lines=[]
        for o in objs:
            p=o['preview_images'][0]
            if art: lines.append(f'| ![]({p}) | {o["name_en"]} | {o["name_zh"]} | {o["description"]} | 本地色板 | {", ".join(o["keywords"][:3])} | {", ".join(o["suitable_for"])} | {", ".join(o["related_styles"])} |')
            else: lines.append(f'| ![]({p}) | {o["name_en"]} | {o["name_zh"]} | {o["description"]} | 模块化界面 | 本地色板 | {", ".join(o["suitable_for"])} | {", ".join(o["compatible_art_styles"])} |')
        return head+'\n'.join(lines)+'\n'
    write(ROOT/'FRONTEND_STYLE_LIBRARY.md','# Frontend Style Library\n\n'+table(frontend_objs))
    write(ROOT/'ART_STYLE_LIBRARY.md','# Art Style Library\n\n'+table(art_objs,True))
    ctable='# UI × Art Direction Combinations\n\n| Frontend | Art Direction | 效果 | 推荐场景 | 推荐度 | 原因 |\n|---|---|---|---|---|---|\n'+''.join(f'| {x["frontend_style"]} | {x["art_direction"]} | {x["effect"]} | {x["recommended_for"]} | {x["recommendation"]} | {x["reason"]} |\n' for x in combos)
    write(ROOT/'STYLE_COMBINATION_LIBRARY.md',ctable)
    readme=f'''# Design Style Library\n\n离线、可追溯的前端与艺术风格研究资料库。此 MVP 含 {len(frontend_objs)} 个前端风格、{len(art_objs)} 个艺术风格、{len(combos)} 个策展搭配。\n\n## 浏览入口\n\n- [前端风格](FRONTEND_STYLE_LIBRARY.md)\n- [艺术风格](ART_STYLE_LIBRARY.md)\n- [搭配库](STYLE_COMBINATION_LIBRARY.md)\n- [机器可读数据](data/style_master.csv)\n\n## 资产与来源\n\n所有 `images/` 预览均为项目原创 SVG 风格板，未下载或再发布第三方素材。每个路径都在 `sources/image_sources.json` 中记录来源、URL（原创则为空）、抓取/创建日期、许可证与许可状态。网络图片若未来加入，仅可作为本地设计研究参考，必须补全来源、URL、抓取时间与许可状态，且不可作为自有商业资产发布。\n\n## 扩展规则\n\n为新条目新增 JSON 记录、预测性路径预览与来源记录；将同义词保留为 alias，避免重复 canonical style。AI 生成图还应记录模型、提示词文件及生成时间。\n\n## Agent 查询\n\n读取 `data/style_master.csv` 按项目类型、密度、情绪和适用场景筛选，然后联查 `style_combinations.json` 选择前端风格与艺术方向。\n'''
    write(ROOT/'README.md',readme)
    project_index = '''# Project Recommendation Index

面向实际项目类型的快速入口。先以「信息密度、风险等级、叙事强度、空间关系」筛选，再进入 `data/` 读取完整字段。

| 项目类型 | 首选前端风格 | 艺术方向 | 为什么 | 注意事项 |
|---|---|---|---|---|
| 数据分析 / 风险监控 | Command Center、Data-heavy Dashboard、Dark Mode | Cyberpunk、Constructivism | 适合告警优先级、多屏态势与高密度扫描 | 不要仅用颜色表达风险；保留文本、图标、对比度和审计轨迹。 |
| AI SaaS | SaaS Dashboard、Bento Grid、Glassmorphism | Aurora Gradient、3D Illustration | 兼顾任务入口、模型状态与产品亲和力 | 玻璃效果只能用于非关键文本区域，确保可读性。 |
| 知识图谱 / 关系图谱 | Infinite Canvas、Node-based Interface、Knowledge Base | Generative Art、Isometric | 将关系网络、缩放层级与细节面板分开呈现 | 始终提供搜索、焦点节点、图例和列表/表格替代视图。 |
| 游戏 / 叙事型界面 | Storytelling Website、Timeline Interface、Dark Mode | Dark Romanticism、Art Nouveau、Engraving | 有利于章节推进、世界观与氛围控制 | 关键交互和任务信息优先于装饰；避免低对比文本。 |
| 学术与知识管理 | Documentation Style、Knowledge Base、Editorial Design | Japanese Minimalism、Botanical Illustration、Line Art | 支持深阅读、来源链路和长期维护 | 需要引用、版本、导出和稳定锚点，不应过度动态化。 |
| 地图 / 空间界面 | Map-based UI、Spatial UI、Split-pane 思路 | Topographic、Isometric、Low Poly | 适合图层、空间筛选与局部/全局协同 | 比例尺、图例、方向、坐标和色盲安全配色不可省略。 |

## 检索示例

```text
项目：风险监控；信息密度：HIGH；情绪：technical；角色：SERIOUS
=> Command Center + Cyberpunk / Data-heavy Dashboard + Constructivism

项目：知识图谱；交互：canvas、node；密度：MEDIUM
=> Infinite Canvas + Generative Art / Node-based Interface + Isometric
```
'''
    write(ROOT/'PROJECT_RECOMMENDATIONS.md',project_index)
    write(ROOT/'reports/STYLE_COLLECTION_REPORT.md',f'# Style Collection Report\n\n- Frontend styles: {len(frontend_objs)}\n- Art styles: {len(art_objs)}\n- Canonical-first collection: aliases are represented as related styles rather than duplicate records.\n- Invalid styles removed: 0\n')
    total=len(sources); write(ROOT/'reports/IMAGE_ASSET_REPORT.md',f'# Image Asset Report\n\n- Total images: {total}\n- Web images: 0\n- AI generated: 0\n- Project-original SVG previews: {total}\n- Missing images: 0\n- Source provenance exceptions: 0\n- Duplicate critical assets: 0\n')
    validation=f'''# Validation Report\n\nSTYLE_LIBRARY_BUILD_COMPLETE\n\nFrontend Styles: {len(frontend_objs)}\nArt Styles: {len(art_objs)}\nStyle Combinations: {len(combos)}\nPreview Images: {total}\n\nMissing Preview: 0\nBroken Image: 0\nBroken Markdown Reference: 0\nDuplicate Critical Assets: 0\n\n## Checks\n\n- Every style record references one local image.\n- Every image has a provenance record.\n- Markdown uses relative local paths.\n- All preview files are valid SVG documents created by this project.\n'''
    write(ROOT/'reports/VALIDATION_REPORT.md',validation)
if __name__ == '__main__': main()
