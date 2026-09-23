# 简历前端交互

路径 `/resume/`。真实结构在 `src/components/sites/yihanglizi-cn-bc4c2f76/resume-d4be9fa6/markup.html`，样式已经包含在原站 CSS。求职历程 `.timeline` 默认倒序，按钮 `.sort-toggle` 切换正序与倒序；三张 `.resume-card` 的 `.resume-view-btn` 打开对应简历详情弹层，支持关闭和 ESC。详页内容若没有公共 HTML 可用，不要编造经历，以时间轴已有信息呈现可读摘要。尽量沿用原站颜色、间距、圆角。

导出 `enhanceResume(root: HTMLElement): () => void` 至 `src/components/sites/yihanglizi-cn-bc4c2f76/shared/resume.ts`。调用方稍后接入。不要修改共享路由、CSS、首页或其他文件。验证类型检查。
