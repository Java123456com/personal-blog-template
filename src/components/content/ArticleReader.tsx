import type { ReactNode } from "react";
import { isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentEntry } from "@/lib/content/types";
import "./ArticleReader.css";

interface HeadingLink {
  depth: number;
  title: string;
  id: string;
}

function slugForHeading(title: string, used: Map<string, number>): string {
  const stem = title.toLocaleLowerCase()
    .replace(/[\p{P}\p{S}]/gu, " ")
    .trim()
    .replace(/\s+/g, "-") || "section";
  const count = used.get(stem) ?? 0;
  used.set(stem, count + 1);
  return count ? `${stem}-${count + 1}` : stem;
}

function stripInlineMarkdown(value: string): string {
  return value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/\\([\\`*_{}\[\]()#+.!>-])/g, "$1")
    .trim();
}

function extractHeadings(markdown: string): HeadingLink[] {
  const headings: HeadingLink[] = [];
  const used = new Map<string, number>();
  const lines = markdown.split(/\r?\n/);
  let fence: string | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fenceMatch = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1];
      else if (fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) fence = null;
      continue;
    }
    if (fence) continue;

    const atx = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    const setext = !atx && line.trim() && lines[index + 1]?.match(/^\s{0,3}(=+|-+)\s*$/);
    const depth = atx ? atx[1].length : setext ? (setext[1][0] === "=" ? 1 : 2) : 0;
    const title = stripInlineMarkdown(atx ? atx[2] : setext ? line : "");
    if (depth && title) headings.push({ depth, title, id: slugForHeading(title, used) });
    if (setext) index += 1;
  }
  return headings;
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

function publishedDate(entry: ContentEntry): string {
  const raw = entry.publishedAt ?? entry.createdAt;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Shanghai",
  }).format(date);
}

export default function ArticleReader({ entry }: { entry: ContentEntry }) {
  const headings = extractHeadings(entry.bodyMd);
  const renderedHeadings = new Map<string, number>();
  const heading = (depth: number, children: ReactNode) => {
    const title = nodeText(children).trim();
    const id = slugForHeading(title, renderedHeadings);
    const Tag = `h${depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    return <Tag id={id}>{children}</Tag>;
  };

  return (
    <main className="article-reader">
      <div className="article-reader__container">
        <div className="article-reader__main">
          <nav className="article-reader__breadcrumb" aria-label="当前位置">
            <a href="/moments/tech/">技术学习记录</a><span aria-hidden="true">/</span><span>{entry.title}</span>
          </nav>

          <article>
            <header className="article-reader__hero">
              <p className="article-reader__eyebrow">TECH JOURNAL · 技术学习</p>
              <h1>{entry.title}</h1>
              {entry.summary && <p className="article-reader__summary">{entry.summary}</p>}
              <div className="article-reader__meta">
                <time dateTime={entry.publishedAt ?? entry.createdAt}>发布于 {publishedDate(entry)}</time>
                {entry.tags.length > 0 && <ul aria-label="文章标签">{entry.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>}
              </div>
            </header>

            <div className="article-reader__prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                skipHtml
                components={{
                  h1: ({ children }) => heading(1, children),
                  h2: ({ children }) => heading(2, children),
                  h3: ({ children }) => heading(3, children),
                  h4: ({ children }) => heading(4, children),
                  h5: ({ children }) => heading(5, children),
                  h6: ({ children }) => heading(6, children),
                }}
              >{entry.bodyMd}</ReactMarkdown>
              <div className="article-reader__endmark" aria-hidden="true">✦</div>
            </div>
          </article>

          <a className="article-reader__back" href="/moments/tech/"><span aria-hidden="true">←</span> 返回文章列表</a>
        </div>

        <aside className="article-reader__toc" aria-label="文章目录">
          <div className="article-reader__toc-inner">
            <p className="article-reader__toc-title">文章目录</p>
            {headings.length > 0 ? (
              <nav>
                {headings.map((item) => (
                  <a
                    className={`article-reader__toc-link article-reader__toc-link--depth-${item.depth}`}
                    href={`#${item.id}`}
                    key={item.id}
                  >{item.title}</a>
                ))}
              </nav>
            ) : <p className="article-reader__toc-empty">这篇文章暂无小标题</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
