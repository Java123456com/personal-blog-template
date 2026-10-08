import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, basename, extname } from "node:path";
import matter from "gray-matter";

/** @typedef {import('../src/lib/content/types').ContentEntry} ContentEntry */

function markdownFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, "en"))
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? markdownFiles(path) : /\.md$/i.test(entry.name) ? [path] : [];
    });
}

function text(value, field, path, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${path}: ${field} is required`);
    return "";
  }
  if (typeof value !== "string" || (required && !value.trim())) {
    throw new Error(`${path}: ${field} must be ${required ? "a nonempty" : "a"} string`);
  }
  return value.trim();
}

function strings(value, field, path) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new Error(`${path}: ${field} must be a list of strings`);
  }
  return [...new Set(value.map((item) => item.trim()))];
}

function timestamp(value, field, path) {
  if (value === undefined) throw new Error(`${path}: ${field} is required (YYYY-MM-DD or ISO timestamp)`);
  const raw = value instanceof Date ? value.toISOString() : String(value);
  const day = raw.slice(0, 10);
  const calendarDate = new Date(`${day}T00:00:00Z`);
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T00:00:00+08:00` : raw;
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(normalized)
      || Number.isNaN(Date.parse(normalized)) || Number.isNaN(calendarDate.getTime())
      || calendarDate.toISOString().slice(0, 10) !== day) {
    throw new Error(`${path}: ${field} must be a valid date or an ISO timestamp with timezone`);
  }
  return new Date(normalized).toISOString();
}

function imageUrl(value, path) {
  if (!/^\/images\//.test(value) || value.includes("..") || value.includes("\\") || /[?#]/.test(value)) {
    throw new Error(`${path}: image paths must start with /images/`);
  }
  if (!existsSync(join(process.cwd(), "public", value.slice(1)))) {
    throw new Error(`${path}: image does not exist: ${value}`);
  }
  return value;
}

/** @returns {ContentEntry[]} */
export function readContentEntries() {
  /** @type {ContentEntry[]} */
  const entries = [];
  const slugs = new Set();
  for (const [directory, type] of /** @type {const} */ ([["articles", "article"], ["life", "moment"]])) {
    for (const path of markdownFiles(join(process.cwd(), "content", directory))) {
      const { data, content } = matter(readFileSync(path, "utf8"));
      if (data.draft !== undefined && typeof data.draft !== "boolean") throw new Error(`${path}: draft must be true or false`);
      if (data.draft === true) continue;
      const slug = text(data.slug, "slug", path) || basename(path, extname(path));
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
        throw new Error(`${path}: slug must use lowercase letters, digits and hyphens (max 120 characters)`);
      }
      const key = `${type}:${slug}`;
      if (slugs.has(key)) throw new Error(`${path}: duplicate slug: ${slug}`);
      slugs.add(key);
      const title = text(data.title, "title", path, true);
      if (!content.trim()) throw new Error(`${path}: Markdown body is empty`);
      const publishedAt = timestamp(data.date, "date", path);
      const images = strings(data.images, "images", path).map((value) => imageUrl(value, path));
      const cover = text(data.cover, "cover", path);
      entries.push({
        id: Number.parseInt(createHash("sha256").update(key).digest("hex").slice(0, 12), 16),
        type, slug, title,
        summary: text(data.summary, "summary", path),
        bodyMd: content.trim(),
        tags: strings(data.tags, "tags", path),
        status: "published",
        coverImageUrl: cover ? imageUrl(cover, path) : null,
        imageUrls: images,
        createdAt: publishedAt,
        updatedAt: data.updated ? timestamp(data.updated, "updated", path) : publishedAt,
        publishedAt,
      });
    }
  }
  return entries.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug, "en"));
}
