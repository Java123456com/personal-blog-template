export type EntryType = "article" | "moment";
export type EntryStatus = "draft" | "published";

export interface ContentEntry {
  id: number;
  type: EntryType;
  slug: string;
  title: string;
  summary: string;
  bodyMd: string;
  tags: string[];
  status: EntryStatus;
  coverMediaId: string | null;
  imageIds: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export function mediaUrl(id: string): string {
  return `/api/media/${encodeURIComponent(id)}`;
}
