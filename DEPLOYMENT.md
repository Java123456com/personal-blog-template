# GitHub Pages 静态部署

仓库：`Java123456com/personal-blog-template`。
静态分支：`codex/static`。原有前后端版本：`codex/fullstack`。

## 首次启用

当前仓库已公开，并启用了通过 GitHub Actions 发布的 Pages。`blog.noova.cloud` 已通过账号级域名所有权验证。以下步骤用于检查配置或重新部署。

1. 仓库 Settings → Pages → Build and deployment，将 Source 设为 GitHub Actions。
2. Custom domain 填入 `blog.noova.cloud` 并保存。在 GitHub 账号 Settings → Pages 验证域名所有权，验证成功后保留对应 TXT 记录。
3. DNSPod 删除 `blog` 当前指向腾讯云的 A 记录（以及同名冲突的 AAAA 记录，如有），添加 CNAME：主机记录 `blog`，记录值 `Java123456com.github.io`。不带协议、路径或仓库名。
4. 等待域名检查和证书签发完成，开启 Enforce HTTPS。
5. 仓库 Settings → Environments → github-pages 的 Deployment branches and tags 中允许 `codex/static` 分支部署。
6. 推送一次静态分支提交触发部署，或从 Actions → Publish static blog 手动运行并选择 `codex/static`。工作流只构建和部署静态分支。

只调整 blog 子域名。主域名的网站部署和备案独立处理；域名注册和 DNS 服务可以继续留在腾讯云。

本项目按自定义域名的根路径构建（如 `/images/`、`/moments/tech/`）。请配置自定义域名，不要将未配置域名的 `github.io/仓库名/` 地址作为正式入口。

## 日常发布

编辑 `content/articles/`、`content/life/` 中的 Markdown，图片放到 `public/images/`，提交并推送到 `codex/static`。工作流重新生成公开网页和搜索索引；构建失败时不会部署半成品。

```sh
npm ci
npm run build
npm start
```

产物在 `out/`，静态预览地址为 `http://127.0.0.1:4173`。产物也可以发布到其他静态托管平台。

## 原有后端

`codex/fullstack` 保留原有代码和部署文档，供本地运行或以后参考。`129.211.11.127` 上的旧博客不再作为发布目标，后续内容只通过静态版发布。

旧部署停用只涉及 Compose 项目 `noova-blog` 和共享 Caddy 中的 `blog.noova.cloud` 代理。`noova.cloud`、`www.noova.cloud` 和服务器上的其他项目继续保留。数据库无需迁移，停用时保留其数据卷和配置便于恢复。

## 官方文档

- [GitHub Pages 自定义子域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)
- [GitHub Actions 发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Next.js 静态导出](https://nextjs.org/docs/app/guides/static-exports)
