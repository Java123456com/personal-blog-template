# 个人博客 · 两套版本

基于 Next.js / React 的个人博客，保留星空极光与赛博编程两套主题，以及技术学习、日常生活、简历、友链、工具和关于页面。

仓库分为前后端版和静态版。当前网站后续使用静态版发布，前后端版保留作为本地运行和开发参考。`main` 提供版本入口说明，具体代码请切换到对应分支。

| 项目 | 前后端版 | 静态版 |
| --- | --- | --- |
| 分支 | [`codex/fullstack`](https://github.com/Java123456com/personal-blog-template/tree/codex/fullstack) | [`codex/static`](https://github.com/Java123456com/personal-blog-template/tree/codex/static) |
| 内容存储 | MySQL 8 | 本地 Markdown 文件 |
| 写作方式 | 网页「＋」管理端，支持草稿、编辑、发布 | 本地编辑 Markdown，提交后自动构建 |
| 图片 | 网页上传到 MySQL | 放入 `public/images/`，在 Markdown 中引用 |
| 运行方式 | Next.js 后端 + MySQL | 静态文件，无需后端或数据库 |
| 页面与浏览功能 | 原有页面和交互 | 保留原有页面和交互，移除「＋」写作入口 |

## 静态版 · 当前使用

```sh
git switch codex/static
npm ci
npm run dev
```

开发地址为 `http://localhost:3000`。技术文章放在 `content/articles/`，生活记录放在 `content/life/`，图片放在 `public/images/`。复制目录中的草稿模板，填写标题、日期、正文等字段，发布时移除 `draft: true` 或改为 `draft: false`。

```sh
npm run build
npm start
```

静态产物位于 `out/`，预览地址为 `http://127.0.0.1:4173`。推送到 `codex/static` 后，GitHub Actions 自动构建；启用 Pages 后自动部署。公开入口计划使用 `blog.noova.cloud`，仓库当前尚未启用 Pages。

- [静态版完整使用说明](https://github.com/Java123456com/personal-blog-template/blob/codex/static/README.md)
- [静态托管与域名配置](https://github.com/Java123456com/personal-blog-template/blob/codex/static/DEPLOYMENT.md)

## 前后端版 · 保留参考

```sh
git switch codex/fullstack
npm ci
```

启动 Windows `MySQL80` 服务，用管理员导入 `db/schema.sql`，为应用配置 `blog` 库的读写权限。复制 `.env.local.example` 为 `.env.local`，填写数据库连接、写作密码和会话密钥，再运行：

```sh
npm run dev -- -p 4173
```

打开 `http://localhost:4173`，通过导航「＋」进入 `/write/` 写作。文章正文和上传的图片保存在 MySQL 中，需要备份数据库。

- [前后端版完整使用说明](https://github.com/Java123456com/personal-blog-template/blob/codex/fullstack/README.md)
- [历史 Docker / Caddy 部署参考](https://github.com/Java123456com/personal-blog-template/blob/codex/fullstack/DEPLOYMENT.md)

`129.211.11.127` 上的旧博客不再作为部署目标。停用范围限于博客项目 `noova-blog` 及其子域名代理，共享 Caddy 和主域名项目继续保留。
