# 个人博客 · 前后端版

Next.js 15、MySQL 8 和 Markdown 驱动的个人博客。首页有星空极光与赛博编程两套主题；技术学习、日常生活、文章阅读和写作页共享导航与背景。

当前分支为 `codex/fullstack`，保留在线写作和图片上传功能，供本地运行或以后参考。网站后续使用[静态版 `codex/static`](https://github.com/Java123456com/personal-blog-template/tree/codex/static)发布；[仓库首页](https://github.com/Java123456com/personal-blog-template/tree/main)提供两套版本的入口。

## Windows MySQL 8.0 本地启动

1. 确认 Windows 的 `MySQL80` 服务已启动。
2. 使用已有管理员账号执行 `db/schema.sql`，例如：`mysql.exe -u root -p < db/schema.sql`。
3. 让一个 MySQL 用户拥有 `blog` 库的 `SELECT、INSERT、UPDATE、DELETE` 权限。
4. 复制 `.env.local.example` 为 `.env.local`，填写该用户密码、写作密码和至少 32 字符的会话密钥。
5. 运行 `npm.cmd install` 和 `npm.cmd run dev -- -p 4173`。

打开 <http://localhost:4173/>。技术学习记录在 `/moments/tech/`，日常生活记录在 `/moments/life/`。不要把 `.env.local` 提交到 Git；正文和图片都在 MySQL 中，备份时要备份 `blog` 数据库。

## Docker 部署参考

`129.211.11.127` 上的旧博客不再作为发布目标。本分支保留 Docker 配置作为历史部署参考，具体布局见 [DEPLOYMENT.md](DEPLOYMENT.md)。如以后另行部署，复制 `.env.example` 为 `.env`，填写配置后运行 `docker compose up --build -d`，并配置 HTTPS 反向代理。本机开发直接连接 Windows MySQL 8.0。

## 写作与图片

点击全站导航最右侧的「＋」进入 `/write/` 管理端。写作页可以新建、保存草稿、发布、编辑、删除和自定义发布日期；文章地址是 `/moments/tech/<slug>/`。正文使用 Markdown，支持常见 GFM 语法。技术文章图片上传后会插入 Markdown；生活记录图片显示在卡片图库中。

图片保存在 MySQL 的 `media` 表。目前接受 JPEG、PNG、WebP、GIF，每张最多 5 MB。这样部署只需要 MySQL，不需要 MinIO；如果日后图片量增长，可以把媒体接口迁往 MinIO，文章数据结构仍可继续使用。

`/blog/` 是旧页面，已不再使用。导航栏「博客」下只保留「技术学习记录」「日常生活记录」。其他页面中的模板占位内容仍可按需逐步替换。
