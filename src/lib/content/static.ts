import type { ContentEntry, EntryType } from "./types";
import { readContentEntries } from "../../../scripts/content.mjs";

export function listEntries(type: EntryType): ContentEntry[] {
  return readContentEntries().filter((entry) => entry.type === type);
}

export function getPublishedArticle(slug: string): ContentEntry | null {
  return listEntries("article").find((entry) => entry.slug === slug) ?? null;
}
