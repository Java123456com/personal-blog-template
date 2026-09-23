# 后续管理端内容模型

当前页面使用静态快照展示内容。管理端和 MySQL 接入时，页面组件不需要重做，只需用以下数据替换对应快照内容。

## 博客文章 `posts`

| 字段 | 用途 |
| --- | --- |
| `id` | 主键 |
| `slug` | 路由，例如 `static-blog-setup` |
| `title`、`excerpt` | 列表卡片和文章头部 |
| `body` | Markdown 或富文本正文 |
| `cover_url` | 文章封面 |
| `category`、`tags` | 分类和标签筛选 |
| `status` | `draft`、`published`、`archived` |
| `published_at`、`updated_at` | 发布和更新时间 |

管理端至少需要文章列表、草稿保存、发布、标签编辑和封面上传。公开端分别读取已发布文章的列表与详情。

## 简历 `resume_profiles`、`resume_timeline`

`resume_profiles` 保存姓名、职位、简介、联系方式、自我评价和技能分类；`resume_timeline` 保存每个经历或简历版本的日期、标题、副标题、描述、标签、排序值与是否公开。这样现有简历页的首屏、时间线、技能栈和弹窗都可以通过同一份数据渲染。

## 自我介绍 `profile`

保存单条公开资料：`headline`、`bio`、`avatar_url`、`location`、`availability`、`tech_stack`、`projects`、`journey`、`contacts`。其中数组字段可先以 JSON 保存，管理端稳定后再拆成项目表和联系方式表。

## 接入顺序

1. 新建 MySQL 表和迁移脚本，保留当前静态数据作为种子数据。
2. 建立仅管理员可访问的登录和内容管理 API。
3. 把当前静态页面的内容读取替换成公开 API；路由和视觉组件维持不变。
4. 增加图片上传、草稿预览、发布记录与回滚。
