"""Make honest local article shells for the source site's three broken links."""

import hashlib
import json
from pathlib import Path

from lxml import html

SITE = Path("src/components/sites/yihanglizi-cn-bc4c2f76")
SOURCE = SITE / "blog-static-blog-setup-html-6da14a89" / "markup.html"
ARTICLES = [
    ("fullstack-project-guide", "全栈项目搭建流程", "全栈开发", "从零到一搭建自己的全栈项目：能力要求、技术栈选型、开发流程与实战经验，掌握核心能力而非追逐技术栈。", ["全栈开发", "AI 辅助", "项目实战"]),
    ("java-learning-roadmap", "Java 网课学习规划", "学习路线", "自用 Java 学习规划：精简冗余、直击核心，从 JavaSE 到项目实战的完整路线图与方法论。", ["Java", "学习路线", "编程入门"]),
    ("ai-usage-guide", "AI 使用文档", "AI 辅助", "开发中 ALL IN AI：主流模型选择、工具集成、MCP 配置与 Vibe Coding 的实战经验分享。", ["AI 编程", "Vibe Coding", "MCP 工具"]),
]

for slug, title, category, summary, tags in ARTICLES:
    route = f"/blog/{slug}.html"
    key = route.strip("/").replace("/", "-").replace(".", "-") + "-" + hashlib.sha256(route.encode()).hexdigest()[:8]
    document = html.fromstring(SOURCE.read_text(encoding="utf-8"))
    hero = document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," article-hero ")]')[0]
    tag_wrap = hero.xpath('.//*[contains(@class,"ah-tags")]')[0]
    tag_wrap.clear()
    tag_wrap.set("class", "ah-tags")
    for tag in tags:
        span = html.Element("span", {"class": "ah-tag"})
        span.text = tag
        tag_wrap.append(span)
    hero.xpath('.//*[contains(@class,"ah-title")]')[0].text = title
    hero.xpath('.//*[contains(@class,"ah-sub")]')[0].text = category
    hero.xpath('.//*[contains(@class,"ah-desc")]')[0].text = summary
    meta = hero.xpath('.//*[contains(@class,"ah-meta-row")]')[0]
    meta.clear()
    meta.set("class", "ah-meta-row")
    meta_item = html.Element("span", {"class": "ah-meta"})
    meta_item.text = "一行栗子 · 2026 年 5 月 31 日 · " + category
    meta.append(meta_item)
    for aside in document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," VPDocAside ")]'):
        aside.getparent().remove(aside)
    body = document.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," vp-doc ")]')[0]
    body.set("class", "vp-doc article-draft")
    body.clear()
    body.set("class", "vp-doc article-draft")
    heading = html.Element("h2")
    heading.text = "文章正文待补充"
    lead = html.Element("p")
    lead.text = summary
    note = html.Element("p", {"class": "article-draft-note"})
    note.text = "此文章暂时只有栏目简介，完整内容尚未发布。"
    link = html.Element("a", href="/blog/")
    link.text = "← 返回博客目录"
    body.extend([heading, lead, note, link])
    out = SITE / key
    out.mkdir(parents=True, exist_ok=True)
    (out / "markup.html").write_text(html.tostring(document, encoding="unicode", method="html"), encoding="utf-8")
    (out / "meta.json").write_text(json.dumps({"route": route, "title": f"{title} | 一行栗子", "key": key, "draft": True}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(route, key)
