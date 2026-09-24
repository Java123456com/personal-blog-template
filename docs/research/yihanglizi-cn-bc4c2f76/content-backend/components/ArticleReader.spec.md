# ArticleReader 规格

参考：`https://yihanglizi.cn/blog/static-blog-setup.html`。目标组件：`src/components/content/ArticleReader.tsx`，样式独立放在 `ArticleReader.css`。

## 结构及样式

- 保留现有全站导航和主题背景。桌面正文参考 `.VPDoc .container`：约 992px，中间内容约 736px，右侧目录约 256px。
- 文章头部参考 `.article-hero`：半透明背景、顶部 16px 圆角、约 46px 顶部内边距和 42px 横向内边距；展示标签、标题、摘要、发布日期。
- 正文参考 `.vp-doc`：半透明深色面板、1px 描边、底部 16px 圆角、约 38px 纵向和 42px 横向内边距；Markdown 的标题、列表、代码、表格、引用和图片保持清晰。
- 目录从 Markdown 标题生成，点击滚动到对应标题；窄屏目录可折叠或放在正文上方。
- 不使用参考作者原文；正文完全来自数据库。

## 行为及响应式

- 交互模型：Markdown 阅读、目录锚点导航，图片可自然缩放；服务端渲染以支持直达链接。
- 列表返回链接指向 `/moments/tech/`。仅管理员可通过「编辑」进入 `/write/?type=article&id=...`。
