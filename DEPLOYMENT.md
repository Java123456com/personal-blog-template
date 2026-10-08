# GitHub Pages 静态部署

仓库：`Java123456com/personal-blog-template`。
静态分支：`codex/static`。原有前后端版本：`codex/fullstack`。

## 首次启用

当前仓库是私有仓库。GitHub Free 只支持从公开仓库发布 Pages；私有仓库需要支持 Pages 的付费套餐。首次启用前请确认账号套餐。仓库尚未启用 Pages 时，工作流会生成静态产物并跳过部署，不会修改仓库的可见性。

1. 仓库 Settings → Pages → Build and deployment，将 Source 设为 GitHub Actions。
2. Custom domain 填入 `blog.noova.cloud` 并保存。建议先在 GitHub 账号 Settings → Pages 按提示添加 TXT 记录，验证域名所有权。
3. DNSPod 删除 `blog` 当前指向腾讯云的 A 记录（以及同名冲突的 AAAA 记录，如有），添加 CNAME：主机记录 `blog`，记录值 `Java123456com.github.io`。不带协议、路径或仓库名。
4. 等待域名检查和证书签发完成，开启 Enforce HTTPS。
5. 首次启用后推送一次静态分支提交触发部署。如果工作流已在默认分支中，也可从 Actions → Publish static blog 手动运行并选择 `codex/static`。

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

`codex/fullstack` 保留原有代码和部署文档。静态分支不操作腾讯云上已运行的容器、数据库或 Caddy；此次无需迁移数据。

## 官方文档

- [GitHub Pages 自定义子域名](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain)
- [GitHub Actions 发布 Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [Next.js 静态导出](https://nextjs.org/docs/app/guides/static-exports)
