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
  coverImageUrl: string | null;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
