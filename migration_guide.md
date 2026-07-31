# 迁移使用说明

本包面向 Windows 本地项目迁移场景：用户将源码包解压到目标电脑的任意项目文件夹中，再通过 Codex、Claude Code 等代码工具发出自然语言指令，让工具读取本地风格资料并落地到自己的前端项目。

## 推荐使用方式

1. 将源码包完整解压到目标项目旁边或目标项目内部，例如：
   - `D:\projects\my-app\style_store`
   - `D:\projects\my-app\docs\style_store`
2. 在 Codex 或 Claude Code 中打开目标项目文件夹。
3. 让工具先读取本包的 `style_summary.md` 或 `style_summary.html`。
4. 使用汇总表中的提示词，例如：
   - `选择包豪斯风格，落地这个项目的前端`
   - `选择浮世绘风格，落地这个项目的前端`
   - `选择超现实主义风格制图`

## 工具读取优先级

建议让工具按下面顺序读取上下文：

1. `风格汇总表.md`
2. 对应风格目录下的 `style.json`
3. 对应风格目录下的 `STYLE_DNA.md`
4. 对应风格目录下的 `UI_TRANSLATION.md`
5. 对应风格目录下的 `previews/` 预览图

示例：

```text
请读取 style_store/style_summary.md，并选择 `bauhaus` 风格。
再读取 style_store/design_style_library/styles/bauhaus/style.json、
STYLE_DNA.md、UI_TRANSLATION.md 和 previews 图片，
将当前项目首页改造成该风格。
```

## Windows 迁移注意事项

- 文件内容为 UTF-8 编码；若旧版 PowerShell 直接 `Get-Content` 出现乱码，通常是终端显示问题，Codex/Claude Code 读取文件不受影响。
- 路径均为相对路径，不依赖原始电脑上的 `E:\`、`C:\Users\...` 等本机路径。
- 交付包不包含 `node_modules`、构建产物、`.env`、日志或缓存。
- 若需要运行 `test/frontend-style-training-pack` 示例前端，请先安装 Node.js 和 pnpm，然后执行 `pnpm install`、`pnpm dev`。
- 示例前端只是参考工程；将风格落地到用户自己的项目时，优先适配用户项目原有技术栈和组件库。

## GitHub URL 与本地包的差异

只把 GitHub URL 发给工具，不一定等同于本地源码包。只有在工具已完整 clone 或读取仓库全部文件、图片和 JSON 时，效果才接近一致。为了稳定迁移，推荐使用本地解压后的源码包。

## 当前建议入口

- Markdown 汇总表：`style_summary.md`
- HTML 汇总表：`style_summary.html`
- 风格资料库：`design_style_library/`
