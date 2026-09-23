# 技术动态前端交互

路径 `/moments/tech/`。真实内容和带 `data-v-*` 的结构已经保存在 `src/components/sites/yihanglizi-cn-bc4c2f76/moments-tech-e3a2705e/markup.html`，全站 CSS 位于 `public/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/assets/original.css`。保持现有排版和文本。

页面头部展示 27 条动态，主列表容器 ID 为 `momentsContent`。两个 `.sort-btn` 默认为“🔽 最新优先”选中，点击“🔼 最早优先”应将每条动态按时间反向排列，再点击可恢复；选中态 `.active` 与按钮文案应同步。每条包含日期、正文、图片；图片点击若原站有大图层，应保留查看和关闭交互。生活动态页 `/moments/life/` 的公开页面只显示口令门禁，不要猜测或泄露受保护内容；只还原公开门禁 UI 与输入反馈。

导出纯 DOM 增强函数 `enhanceMoments(root: HTMLElement, path: string): () => void` 至 `src/components/sites/yihanglizi-cn-bc4c2f76/shared/moments.ts`。调用方稍后接入页面客户端组件。不要修改共享路由、CSS、首页或其他文件。验证 `npm.cmd run typecheck`。
