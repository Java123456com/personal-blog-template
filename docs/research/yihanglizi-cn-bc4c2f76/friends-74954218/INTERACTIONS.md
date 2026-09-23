# 友链前端交互

路径 `/friends/`。真实结构位于 `src/components/sites/yihanglizi-cn-bc4c2f76/friends-74954218/markup.html`；全站 CSS 位于 `public/sites/yihanglizi-cn-bc4c2f76/root-8a5edab2/assets/original.css`。七个友链节点和本节点内容已在 HTML 里。

“▦ 列表 / ✦ 星图”是 `.view-btn` 视图切换，默认列表，激活样式 `.active`。节点按钮有目标地址（从 HTML 属性或紧邻文本可查）；点击应在新标签打开对应友站。`申请友链` 下三处 `.apply-copy` 复制 name/url/desc 并给出短反馈。保留原站现有视觉结构，使用 DOM 增强。

导出 `enhanceFriends(root: HTMLElement): () => void` 至 `src/components/sites/yihanglizi-cn-bc4c2f76/shared/friends.ts`。调用方稍后接入。不要修改共享路由、CSS、首页或其他文件。验证类型检查。
