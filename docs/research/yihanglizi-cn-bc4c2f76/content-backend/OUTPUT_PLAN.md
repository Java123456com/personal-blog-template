# 内容系统输出计划

- `/moments/tech/`：技术学习文章列表，借鉴 `https://yihanglizi.cn/blog/` 的横幅和卡片结构。更新已有技术记录路由。
- `/moments/tech/[slug]/`：Markdown 阅读页，借鉴 `https://yihanglizi.cn/blog/static-blog-setup.html` 的文章头部、正文及目录。新路由。
- `/moments/life/`：日常生活时间线，借鉴 `https://yihanglizi.cn/moments/tech/` 的横幅、排序与图文卡片。更新已有生活记录路由。
- `/write/`：登录、文章和生活记录编辑器，从上述两页右侧的「＋ 记录」进入。新路由。
- `/api/admin/session`、`/api/entries`、`/api/entries/[id]`、`/api/media`、`/api/media/[id]`：服务端 API。
- `db/schema.sql`、`docker-compose.yml`：MySQL 数据与本地启动。Markdown 正文和图片二进制均存入 MySQL，不要求 MinIO。

沿用现有全站主题、导航、背景和内容宽度，不恢复旧 `/blog/` 页面。参考站作者的内容不复制入用户数据库。
