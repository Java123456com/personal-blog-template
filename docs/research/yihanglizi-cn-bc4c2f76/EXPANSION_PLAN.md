# 同站页面扩展计划

目标站点 `https://yihanglizi.cn`，Next.js 应用根目录为本仓库。现有 `/` 页面保留。

| 原站路径 | 本地路径 | 内容来源 |
| --- | --- | --- |
| `/blog/` | `/blog/` | 本地页面内容 |
| `/blog/{static-blog-setup,fullstack-project-guide,java-learning-roadmap,ai-usage-guide}.html` | 同路径 | 本地页面内容 |
| `/moments/tech/`, `/moments/life/` | 同路径 | 本地页面内容 |
| `/friends/`, `/tools/`, `/about/`, `/resume/` | 同路径 | 本地页面内容 |

每页研究和截图位于 `docs/research/yihanglizi-cn-bc4c2f76/<路径缩写>-<SHA256路径前八位>/` 与对应的 `docs/design-references`，页面快照置于同名组件目录。共享字体、CSS 和图片位于 `public/sites/yihanglizi-cn-bc4c2f76/shared/`。动态路由只处理原站已确认的路径，不覆盖首页。当前阶段仅做前端；未来博客、简历和自我介绍将由管理端编辑并从数据库读取。

交互检查：导航、搜索、朋友圈菜单属于所有页共享；技术动态有时间排序，生活动态有口令门禁，友链有列表/星图视图，简历有时间轴倒序和简历弹层，博客有文章锚点与详情页。公开快照中的生活动态只包含门禁，不包含受保护内容。
