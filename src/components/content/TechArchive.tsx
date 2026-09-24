import type { ContentEntry } from "@/lib/content/types";
import "./TechArchive.css";

function publishedDate(entry: ContentEntry): string {
  const raw = entry.publishedAt ?? entry.createdAt;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Shanghai",
  }).formatToParts(date);
  const pick = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${pick("year")}-${pick("month")}-${pick("day")}`;
}

export default function TechArchive({ entries }: { entries: ContentEntry[] }) {
  const articles = entries
    .filter((entry) => entry.type === "article" && entry.status === "published" && entry.slug)
    .sort((a, b) => Date.parse(b.publishedAt ?? b.createdAt) - Date.parse(a.publishedAt ?? a.createdAt));
  const currentYear = new Date().getFullYear();
  const firstYear = articles.reduce((earliest, entry) => {
    const year = new Date(entry.publishedAt ?? entry.createdAt).getFullYear();
    return Number.isFinite(year) ? Math.min(earliest, year) : earliest;
  }, currentYear);

  return (
    <main className="tech-archive">
      <header className="tech-archive__hero">
        <video
          className="tech-archive__hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/sites/yihanglizi-cn-bc4c2f76/shared/videos/tech-hero-frame.png"
          aria-hidden="true"
        >
          <source src="/sites/yihanglizi-cn-bc4c2f76/moments-tech-e3a2705e/videos/tech.mp4" type="video/mp4" />
        </video>
        <div className="tech-archive__hero-overlay" aria-hidden="true" />
        <div className="tech-archive__hero-orbs" aria-hidden="true">
          <span className="tech-archive__orb tech-archive__orb--one" />
          <span className="tech-archive__orb tech-archive__orb--two" />
          <span className="tech-archive__orb tech-archive__orb--three" />
        </div>
        <div className="tech-archive__hero-inner">
          <p className="tech-archive__eyebrow"><span aria-hidden="true">⚡</span> TECH</p>
          <h1>技术学习记录</h1>
          <p className="tech-archive__subtitle">一行行代码，铺成通往未来的路 · 记录每一次成长</p>
          <div className="tech-archive__stats" aria-label="技术学习记录统计">
            <span><b>{articles.length}</b> 条记录</span>
            <i aria-hidden="true" />
            <span>持续 <b>更新中</b></span>
            <i aria-hidden="true" />
            <span><b>{firstYear}</b> 至今</span>
          </div>
        </div>
        <div className="tech-archive__hero-fade" aria-hidden="true" />
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
                  <article className={`tech-archive__card tech-archive__card--tone-${index % 4}`} key={entry.id} id={`article-${entry.id}`}>
                    <div className="tech-archive__card-kicker">
                      <span className="tech-archive__card-number">{String(index + 1).padStart(2, "0")}</span>
                      <span className="tech-archive__card-category">{entry.tags[0] || "技术学习"}</span>
                    </div>
                    <h3><a href={href}>{entry.title}</a></h3>
                    {entry.summary && <p className="tech-archive__summary">{entry.summary}</p>}
                    {entry.tags.length > 0 && (
                      <ul className="tech-archive__tags" aria-label="文章标签">
                        {entry.tags.map((tag) => <li key={tag}>#{tag}</li>)}
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
    </main>
  );
}
