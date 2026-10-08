# 部署说明 · 两套版本

## 静态版

当前博客使用 `codex/static` 分支发布，目标域名为 `blog.noova.cloud`。GitHub Actions 生成并部署 `out/` 静态文件，也可将产物放到其他静态托管平台。

仓库已公开，Pages 已启用并绑定了通过所有权验证的 `blog.noova.cloud`。在 DNSPod 将 `blog` 设置为指向 `Java123456com.github.io` 的 CNAME，待证书签发后启用 HTTPS。保留 GitHub 域名验证所用的 TXT 记录。

完整配置见[静态版部署说明](https://github.com/Java123456com/personal-blog-template/blob/codex/static/DEPLOYMENT.md)。

## 前后端版

`codex/fullstack` 保留 Next.js + MySQL + Docker + Caddy 的原有实现，用于本地运行和开发参考。

`129.211.11.127` 上的旧博客不再作为部署目标。旧部署目录为 `/home/ubuntu/personal-blog`，Compose 项目名为 `noova-blog`。停用只涉及博客容器及共享 Caddy 中的 `blog.noova.cloud` 代理；保留主域名项目、共享 Caddy、外部网络和 MySQL 数据卷。

历史配置见[前后端版部署参考](https://github.com/Java123456com/personal-blog-template/blob/codex/fullstack/DEPLOYMENT.md)。
