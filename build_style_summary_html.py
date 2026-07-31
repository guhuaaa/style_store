from html import escape
from pathlib import Path


STYLES = [
    ("abstract_expressionism", "抽象表现主义"),
    ("art_deco", "装饰艺术"),
    ("art_nouveau", "新艺术"),
    ("arts_and_crafts", "工艺美术运动"),
    ("baroque", "巴洛克"),
    ("bauhaus", "包豪斯"),
    ("color_field", "色域绘画"),
    ("constructivism", "构成主义"),
    ("cubism", "立体主义"),
    ("dada", "达达主义"),
    ("de_stijl", "风格派"),
    ("expressionism", "表现主义"),
    ("fauvism", "野兽派"),
    ("futurism", "未来主义"),
    ("hard_edge", "硬边绘画"),
    ("impressionism", "印象派"),
    ("mexican_muralism", "墨西哥壁画运动"),
    ("minimalism_art", "极简主义"),
    ("neoclassicism", "新古典主义"),
    ("op_art", "欧普艺术"),
    ("orphism", "奥费主义"),
    ("pop_art", "波普艺术"),
    ("post_impressionism", "后印象派"),
    ("precisionism", "精确主义"),
    ("renaissance", "文艺复兴"),
    ("rococo", "洛可可"),
    ("romanticism", "浪漫主义"),
    ("suprematism", "至上主义"),
    ("surrealism", "超现实主义"),
    ("symbolism", "象征主义"),
    ("ukiyo_e", "浮世绘"),
    ("vorticism", "漩涡主义"),
]

SELECTED_FRONTEND_PREVIEWS = {
    "baroque": "medium_rendered.png",
    "romanticism": "medium_rendered.png",
}


def preview_path(slug: str) -> str:
    return f"design_style_library/styles/{slug}/previews/overview_chatgpt_rendered.png"


def frontend_preview_path(slug: str) -> str:
    preview_dir = Path("design_style_library") / "styles" / slug / "previews"
    selected = SELECTED_FRONTEND_PREVIEWS.get(slug)
    if selected:
        path = preview_dir / selected
        if path.exists():
            return path.as_posix()
        raise FileNotFoundError(f"Missing selected frontend preview for {slug}: {path}")

    candidates = [
        "medium_chatgpt_rendered.png",
        "medium_hybrid_rendered.png",
        "medium_v2.png",
        "medium_rendered.png",
        "medium.png",
    ]
    for filename in candidates:
        path = preview_dir / filename
        if path.exists():
            return path.as_posix()
    raise FileNotFoundError(f"Missing frontend preview for {slug}")


def build_html() -> str:
    missing = [path for slug, _ in STYLES if not Path(path := preview_path(slug)).exists()]
    if missing:
        missing_list = "\n".join(missing)
        raise FileNotFoundError(f"Missing overview preview files:\n{missing_list}")

    rows = []
    for slug, label in STYLES:
        preview = preview_path(slug)
        frontend_preview = frontend_preview_path(slug)
        frontend_prompt = f"选择{label}风格，落地这个项目的前端"
        image_prompt = f"选择{label}风格制图"
        rows.append(
            "        <tr data-style=\"{slug}\">\n"
            "          <td class=\"style-name\">{label}</td>\n"
            "          <td><code>{slug}</code></td>\n"
            "          <td>{frontend_prompt}</td>\n"
            "          <td>{image_prompt}</td>\n"
            "          <td>\n"
            "            <a class=\"preview-link\" href=\"{frontend_preview}\" title=\"打开 {label} 前端预览图\">\n"
            "              <img class=\"preview\" src=\"{frontend_preview}\" alt=\"{label}前端预览图\" loading=\"lazy\">\n"
            "            </a>\n"
            "          </td>\n"
            "          <td>\n"
            "            <a class=\"preview-link\" href=\"{preview}\" title=\"打开 {label} 概述预览图\">\n"
            "              <img class=\"preview\" src=\"{preview}\" alt=\"{label}概述预览图\" loading=\"lazy\">\n"
            "            </a>\n"
            "          </td>\n"
            "        </tr>".format(
                slug=escape(slug),
                label=escape(label),
                frontend_prompt=escape(frontend_prompt),
                image_prompt=escape(image_prompt),
                frontend_preview=escape(frontend_preview),
                preview=escape(preview),
            )
        )

    template = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>风格汇总表</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f6f0e6;
      --paper: #fffaf0;
      --ink: #2d281f;
      --muted: #6f6758;
      --line: #d8cbb6;
      --accent: #6f7f55;
      --accent-dark: #3f5037;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: "Noto Serif SC", "Songti SC", "SimSun", serif;
      line-height: 1.55;
    }

    main {
      width: min(1760px, calc(100vw - 48px));
      margin: 32px auto 48px;
    }

    header {
      display: flex;
      align-items: end;
      justify-content: space-between;
      gap: 24px;
      margin-bottom: 18px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 16px;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 3vw, 44px);
      font-weight: 500;
      letter-spacing: 0;
    }

    .meta {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 15px;
    }

    .summary {
      color: var(--accent-dark);
      font-size: 15px;
      white-space: nowrap;
    }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--line);
      background: var(--paper);
      box-shadow: 0 10px 30px rgba(45, 40, 31, 0.08);
    }

    table {
      width: 100%;
      min-width: 1180px;
      border-collapse: collapse;
    }

    th,
    td {
      border-bottom: 1px solid var(--line);
      border-right: 1px solid var(--line);
      padding: 14px 16px;
      vertical-align: middle;
      text-align: left;
    }

    th:last-child,
    td:last-child {
      border-right: 0;
    }

    tr:last-child td {
      border-bottom: 0;
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #efe5d2;
      color: var(--accent-dark);
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
    }

    tbody tr:nth-child(even) {
      background: rgba(111, 127, 85, 0.055);
    }

    .style-name {
      width: 160px;
      font-size: 18px;
      white-space: nowrap;
    }

    code {
      color: var(--accent-dark);
      font-family: Consolas, "SFMono-Regular", monospace;
      font-size: 13px;
      white-space: nowrap;
    }

    .preview-link {
      display: block;
      width: 300px;
      height: 200px;
      border: 1px solid #b7aa90;
      background: #e9dfca;
      overflow: hidden;
    }

    .preview {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .lightbox {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 32px;
      background: rgba(20, 18, 14, 0.78);
      z-index: 20;
    }

    .lightbox.is-open {
      display: flex;
    }

    .lightbox img {
      max-width: min(96vw, 1536px);
      max-height: 92vh;
      border: 1px solid rgba(255, 250, 240, 0.45);
      background: var(--paper);
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.4);
    }

    @media (max-width: 760px) {
      main {
        width: calc(100vw - 24px);
        margin: 18px auto 32px;
      }

      header {
        display: block;
      }

      .summary {
        margin-top: 8px;
        white-space: normal;
      }

      th,
      td {
        padding: 12px;
      }

      .preview-link {
        width: 240px;
        height: 160px;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>风格汇总表</h1>
        <p class="meta">原前端预览图和新概述预览图分列展示；概述预览图统一放在最后一列。</p>
      </div>
      <div class="summary">共 32 种风格</div>
    </header>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>风格名称</th>
            <th>风格 ID</th>
            <th>前端提示词</th>
            <th>图像提示词</th>
            <th>前端预览图</th>
            <th>概述预览图</th>
          </tr>
        </thead>
        <tbody>
__ROWS__
        </tbody>
      </table>
    </div>
  </main>

  <div class="lightbox" id="lightbox" aria-hidden="true">
    <img id="lightbox-image" alt="">
  </div>

  <script>
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightbox-image");

    document.querySelectorAll(".preview-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        lightboxImage.src = link.href;
        lightboxImage.alt = link.querySelector("img").alt;
        lightbox.classList.add("is-open");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });

    lightbox.addEventListener("click", () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImage.removeAttribute("src");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        lightbox.click();
      }
    });
  </script>
</body>
</html>
"""
    return template.replace("__ROWS__", "\n".join(rows))


def build_markdown() -> str:
    lines = [
        "# 风格汇总表",
        "",
        "| 风格名称 | 风格 ID | 前端提示词 | 图像提示词 | 前端预览图 | 概述预览图 |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for slug, label in STYLES:
        preview = preview_path(slug)
        frontend_preview = frontend_preview_path(slug)
        lines.append(
            f"| {label} | `{slug}` | 选择{label}风格，落地这个项目的前端 | 选择{label}风格制图 | ![{label}前端预览图]({frontend_preview}) | ![{label}概述预览图]({preview}) |"
        )
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    Path("style_summary.html").write_text(build_html(), encoding="utf-8")
    Path("style_summary.md").write_text(build_markdown(), encoding="utf-8")
    print(f"Wrote style_summary.html and style_summary.md for {len(STYLES)} styles.")


if __name__ == "__main__":
    main()
