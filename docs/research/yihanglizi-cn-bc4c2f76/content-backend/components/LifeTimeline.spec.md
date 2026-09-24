# LifeTimeline 规格

参考：`https://yihanglizi.cn/moments/tech/`。目标组件：`src/components/content/LifeTimeline.tsx`，样式独立放在 `LifeTimeline.css`。

## 结构及样式

- 沿用当前全站导航与背景。横幅复用现有生活记录素材，参考高度 430px、22.4px 圆角，并保留标题、描述、记录总数。
- 横幅下为右对齐的最新/最早排序按钮；时间线左侧连续竖线，卡片从左侧约 45px 处开始。
- 卡片参考 `.moment-card`：深色半透明背景、1px 边框、16px 圆角、24px 内边距和 24px 卡片间距。展示日期、Markdown 内容和上传图片；图片网格随数量响应式排列。
- 右侧提供「＋ 记录」入口，链接 `/write/?type=moment`。空状态展示「还没有生活记录」。

## 行为及响应式

- 交互模型：排序按钮切换记录顺序，点击图片打开灯箱。内容来自 `ContentEntry[]`，仅公开已发布记录。
- 窄屏保持单列时间线与可点击的大按钮，图片不得溢出视口。
