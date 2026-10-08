# 个人博客 · 静态版

保留现有 Next.js / React 页面、星空极光与赛博编程主题、搜索、Markdown 阅读、Mermaid、生活照片图库和其他浏览交互。内容从本地 Markdown 构建成静态文件，公开网站无需后端或数据库。

## 版本与分支

- `codex/fullstack`：原有 Next.js + MySQL + Docker + Caddy 版本，保留「＋」写作功能。
- `main`：当前静态版和唯一的自动发布分支，去掉「＋」，用本地 Markdown 和图片更新内容。
- `codex/static`：静态版日常开发和内容提交分支，修改验证后合并到 `main`。

日常更新先提交到 `codex/static`，再合并到 `main` 发布，每次发布后保持两分支代码一致。需要在线写作时请查看[前后端版说明](https://github.com/Java123456com/personal-blog-template/blob/codex/fullstack/README.md)。

## 本地开发和发布预览

```sh
npm ci
npm run dev
```

开发地址为 `http://localhost:3000`。修改 Markdown 后重启开发命令，以重新生成搜索索引。

```sh
npm run build
npm start
```

第二组命令在 `http://127.0.0.1:4173` 预览真正的静态产物 `out/`，不运行 Next.js 后端。

## 内容文件

- 技术文章：`content/articles/*.md`，支持子目录。
- 生活记录：`content/life/*.md`，支持子目录。
- 图片：`public/images/`。
- 两个目录中的 `_example.md` 都是草稿模板，不会发布到网站或搜索中。

在 GitHub 网页上传时，先选 `codex/static`，进入文章或图片对应的目录，再使用 Add file → Upload files。提交后将 `codex/static` 合并到 `main` 才会发布。技术文章和生活记录都要带下方所示的 YAML 元数据；正文引用 `public/images/photo.jpg` 时，网页路径写 `/images/photo.jpg`。

复制模板，填写标题、日期、正文和 slug，再将 `draft: true` 改为 `draft: false`，或删除 draft 字段。slug 使用小写英文、数字和连字符，同一分类不能重复。

```markdown
---
title: 我的技术学习记录
slug: my-first-post
date: "2026-10-08"
summary: 这篇文章讲了什么。
tags: [Java, 学习记录]
draft: false
---

## 一个小标题

正文支持 Markdown、GFM 表格、任务列表、代码块和 Mermaid 图表。

![项目架构图](/images/project-architecture.png)
```

`date` 必填，使用带引号的 `YYYY-MM-DD` 或带时区的 ISO 时间，如 `2026-10-08T20:00:00+08:00`。显示日期保持北京时间。`updated` 可选，格式相同；`summary`、`tags`、`cover`、`images` 也可选。

生活记录的照片列表写在元数据中：

```yaml
images:
  - /images/trip/01.jpg
  - /images/trip/02.jpg
```

照片继续使用原有图库和点击放大效果，也可以嵌入 Markdown 正文。images 和 cover 必须指向 `public/images/` 中已存在的文件。

技术文章地址为 `/moments/tech/<slug>/`。搜索索引包括标题、标签、摘要和正文。草稿不会生成网页或进入搜索；公开 GitHub 仓库中的草稿源文件仍可被仓库访客读取。

## 背景视频兼容

首页、技术和生活页先显示背景封面图，再启用视频。百度 App / 百度浏览器，以及开启系统「减少动态效果」的设备使用静态封面，避免内置播放器覆盖网页；主题切换、菜单、搜索和星空交互仍可使用。其他浏览器保留静音内联背景视频。

运行 `node scripts/verify-background-video.mjs` 检查背景兼容逻辑。该检查在 Chrome 中模拟百度的浏览器标识；百度实际设备的播放器表现仍需在手机上验证。

## 自动发布

当前仓库已公开，GitHub Pages 已启用，使用 GitHub Actions 发布 `main` 分支。域名为 `blog.noova.cloud`；解析和 HTTPS 状态可在仓库 Settings → Pages 中查看。

先在 `codex/static` 提交并推送，再合并到 `main` 并推送；GitHub Actions 只在 `main` 构建并部署 `out/`。发布完成后两分支保持相同代码，本地回到 `codex/static` 继续开发。也可以从 Actions → Publish static blog → Run workflow 中选择 `main` 手动发布。操作步骤见 [DEPLOYMENT.md](DEPLOYMENT.md)。

静态文件更新需要等待构建和部署完成。不要上传 `.env`、数据库备份或私钥。
