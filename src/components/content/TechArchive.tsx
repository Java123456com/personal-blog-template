import type { ContentEntry } from "@/lib/content/types";
import "./TechArchive.css";

function publishedDate(entry: ContentEntry): string {
  const raw = entry.publishedAt ?? entry.createdAt;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export default function TechArchive({ entries }: { entries: ContentEntry[] }) {
  const articles = entries
    .filter((entry) => entry.type === "article" && entry.status === "published" && entry.slug)
    .sort((a, b) => Date.parse(b.publishedAt ?? b.createdAt) - Date.parse(a.publishedAt ?? a.createdAt));

  return (
    <main className="tech-archive">
      <header className="tech-archive__hero">
        <div className="tech-archive__hero-media" aria-hidden="true" />
        <div className="tech-archive__hero-inner">
          <p className="tech-archive__eyebrow"><span aria-hidden="true">✶</span> TECH JOURNAL · 技术手记</p>
          <h1>技术学习记录</h1>
          <p className="tech-archive__subtitle">学过的知识，写成可以回看的文章。</p>
          <a className="tech-archive__start" href="#tech-articles">
            开始阅读 <span aria-hidden="true">↓</span>
          </a>
          <p className="tech-archive__hero-count">▤ {articles.length} 篇文章</p>
        </div>
        <a className="tech-archive__scroll" href="#tech-articles" aria-label="跳转到文章列表">
          <span>SCROLL TO EXPLORE</span><span aria-hidden="true">↓</span>
        </a>
      </header>

      <section className="tech-archive__section" id="tech-articles" aria-labelledby="tech-articles-heading">
        <div className="tech-archive__inner">
          <div className="tech-archive__section-head">
            <div>
              <p className="tech-archive__section-kicker">ARCHIVE / {String(articles.length).padStart(2, "0")}</p>
              <h2 id="tech-articles-heading">文章索引</h2>
            </div>
            <span className="tech-archive__section-count">共 {articles.length} 篇</span>
          </div>

          {articles.length === 0 ? (
            <div className="tech-archive__empty" role="status">
              <span aria-hidden="true">✦</span>
              <h3>还没有文章</h3>
              <p>发布第一篇技术学习记录后，文章会出现在这里。</p>
            </div>
          ) : (
            <div className="tech-archive__list">
              {articles.map((entry, index) => {
                const href = `/moments/tech/${encodeURIComponent(entry.slug)}/`;
                return (
                  <article className="tech-archive__card" key={entry.id} id={`article-${entry.id}`}>
                    <div className="tech-archive__card-kicker">
                      <span className="tech-archive__card-number">{String(index + 1).padStart(2, "0")}</span>
                      <span>技术学习</span>
                    </div>
                    <h3><a href={href}>{entry.title}</a></h3>
                    {entry.summary && <p className="tech-archive__summary">{entry.summary}</p>}
                    {entry.tags.length > 0 && (
                      <ul className="tech-archive__tags" aria-label="文章标签">
                        {entry.tags.map((tag) => <li key={tag}>{tag}</li>)}
                      </ul>
                    )}
                    <div className="tech-archive__card-bottom">
                      <time dateTime={entry.publishedAt ?? entry.createdAt}>{publishedDate(entry)}</time>
                      <a href={href} aria-label={`阅读《${entry.title}》`}>阅读全文 <span aria-hidden="true">↗</span></a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <a className="tech-archive__write" href="/write/?type=article" aria-label="记录新的技术学习文章">
        <span aria-hidden="true">＋</span><span>记录</span>
      </a>
    </main>
  );
}
