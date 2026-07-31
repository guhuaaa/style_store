# Project Recommendation Index

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
