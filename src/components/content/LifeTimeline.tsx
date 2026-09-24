"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ContentEntry } from "../../lib/content/types";
import { mediaUrl } from "../../lib/content/types";
import "./LifeTimeline.css";

type SortOrder = "newest" | "oldest";
type LightboxImage = { src: string; alt: string };

function entryDate(entry: ContentEntry): string {
  return entry.publishedAt || entry.createdAt;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(date);
}

export function LifeTimeline({ entries }: { entries: ContentEntry[] }) {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [lightbox, setLightbox] = useState<LightboxImage | null>(null);

  const visibleEntries = useMemo(() => {
    return entries
      .filter((entry) => entry.type === "moment" && entry.status === "published")
      .sort((a, b) => {
        const delta = new Date(entryDate(b)).getTime() - new Date(entryDate(a)).getTime();
        return (sortOrder === "newest" ? delta : -delta) || a.id - b.id;
      });
  }, [entries, sortOrder]);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  return (
    <section className="life-timeline" aria-label="日常生活记录">
      <header className="life-timeline__hero">
        <img
          className="life-timeline__hero-image"
          src="/sites/yihanglizi-cn-bc4c2f76/shared/videos/life-hero-frame.png"
          alt=""
          aria-hidden="true"
        />
        <div className="life-timeline__hero-shade" aria-hidden="true" />
        <div className="life-timeline__hero-content">
          <span className="life-timeline__eyebrow">🌿 LIFE</span>
          <h1>日常生活记录</h1>
          <p>把日子里值得留住的片刻，慢慢记下来。</p>
          <span className="life-timeline__count">
            <strong>{visibleEntries.length}</strong> 条记录
          </span>
        </div>
      </header>

      <div className="life-timeline__toolbar">
        <div className="life-timeline__sort" role="group" aria-label="记录排序">
          <button
            type="button"
            className={sortOrder === "newest" ? "is-active" : ""}
            aria-pressed={sortOrder === "newest"}
            onClick={() => setSortOrder("newest")}
          >
            最新
          </button>
          <button
            type="button"
            className={sortOrder === "oldest" ? "is-active" : ""}
            aria-pressed={sortOrder === "oldest"}
            onClick={() => setSortOrder("oldest")}
          >
            最早
          </button>
        </div>
      </div>

      {visibleEntries.length === 0 ? (
        <div className="life-timeline__empty" role="status">
          <span aria-hidden="true">✦</span>
          <h2>还没有生活记录</h2>
          <p>写下第一条生活记录，它会出现在这里。</p>
        </div>
      ) : (
        <ol className="life-timeline__list">
          {visibleEntries.map((entry) => (
            <li className="life-timeline__item" key={entry.id}>
              <article className="life-timeline__card">
                <time className="life-timeline__date" dateTime={entryDate(entry)}>
                  {formatDate(entryDate(entry))}
                </time>
                {entry.title && <h2>{entry.title}</h2>}
                <div className="life-timeline__markdown">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      img: ({ src, alt }) => {
                        if (typeof src !== "string" || !src) return null;
                        return (
                          <button
                            className="life-timeline__inline-image"
                            type="button"
                            aria-label={`查看图片：${alt || "记录图片"}`}
                            onClick={() => setLightbox({ src, alt: alt || "记录图片" })}
                          >
                            <img src={src} alt={alt || "记录图片"} loading="lazy" />
                          </button>
                        );
                      },
                    }}
                  >
                    {entry.bodyMd}
                  </ReactMarkdown>
                </div>
                {entry.imageIds.length > 0 && (
                  <div className="life-timeline__images" aria-label="记录图片">
                    {entry.imageIds.map((id, index) => {
                      const src = mediaUrl(id);
                      const alt = `${entry.title || "生活记录"}，图片 ${index + 1}`;
                      return (
                        <button
                          className="life-timeline__image"
                          type="button"
                          key={id}
                          aria-label={`查看${alt}`}
                          onClick={() => setLightbox({ src, alt })}
                        >
                          <img src={src} alt={alt} loading="lazy" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            </li>
          ))}
        </ol>
      )}

      {lightbox && (
        <div
          className="life-timeline__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="查看记录图片"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="life-timeline__lightbox-close"
            aria-label="关闭图片"
            autoFocus
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
