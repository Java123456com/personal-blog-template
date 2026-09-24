import { randomUUID } from "node:crypto";
import type { EntryInput } from "./db";

const mediaId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseEntryInput(raw: unknown): EntryInput {
  if (!raw || typeof raw !== "object") throw new Error("缺少内容数据");
  const value = raw as Record<string, unknown>;
  const type = value.type;
  const status = value.status;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const summary = typeof value.summary === "string" ? value.summary.trim() : "";
  const bodyMd = typeof value.bodyMd === "string" ? value.bodyMd.trim() : "";
  const slug = typeof value.slug === "string" && value.slug.trim()
    ? value.slug.trim().toLowerCase()
    : `${type === "moment" ? "moment" : "post"}-${randomUUID().slice(0, 8)}`;
  const tags = Array.isArray(value.tags) ? value.tags : [];
  const imageIds = Array.isArray(value.imageIds) ? value.imageIds : [];
  const coverMediaId = value.coverMediaId == null || value.coverMediaId === "" ? null : value.coverMediaId;

  if (type !== "article" && type !== "moment") throw new Error("内容类型无效");
  if (status !== "draft" && status !== "published") throw new Error("发布状态无效");
  if (!title || title.length > 180) throw new Error("标题需为 1–180 字");
  if (summary.length > 600) throw new Error("摘要不能超过 600 字");
  if (!bodyMd || bodyMd.length > 500_000) throw new Error("正文需为 1–500000 字");
  if (slug.length > 120 || !slugPattern.test(slug)) throw new Error("链接标识只能包含小写字母、数字和连字符");
  if (tags.length > 12 || !tags.every(tag => typeof tag === "string" && tag.trim().length > 0 && tag.length <= 30)) throw new Error("标签最多 12 个，每个不超过 30 字");
  if (imageIds.length > 12 || !imageIds.every(id => typeof id === "string" && mediaId.test(id))) throw new Error("图片最多 12 张");
  if (coverMediaId !== null && (typeof coverMediaId !== "string" || !mediaId.test(coverMediaId))) throw new Error("封面图片无效");

  return {
    type,
    status,
    slug,
    title,
    summary,
    bodyMd,
    tags: tags.map(tag => (tag as string).trim()),
    coverMediaId,
    imageIds,
  };
}
