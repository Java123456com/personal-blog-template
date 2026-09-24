import mysql, { type Pool, type RowDataPacket, type ResultSetHeader } from "mysql2/promise";
import type { ContentEntry, EntryType } from "./types";

let pool: Pool | undefined;

export function databaseConfigured(): boolean {
  return Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER && process.env.MYSQL_PASSWORD && process.env.MYSQL_DATABASE);
}

function getPool(): Pool {
  if (!databaseConfigured()) throw new Error("MySQL 尚未配置，请设置 MYSQL_* 环境变量。");
  pool ??= mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 8,
    dateStrings: true,
    charset: "utf8mb4",
  });
  return pool;
}

interface EntryRow extends RowDataPacket {
  id: number;
  type: EntryType;
  slug: string;
  title: string;
  summary: string;
  body_md: string;
  tags: string | string[];
  status: "draft" | "published";
  cover_media_id: string | null;
  image_ids: string | string[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

function parseArray(value: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch { return []; }
}

function iso(value: string | null): string | null {
  if (!value) return null;
  const configured = process.env.MYSQL_TIMEZONE_OFFSET || "+08:00";
  const offset = /^[+-](?:0\d|1\d|2[0-3]):[0-5]\d$/.test(configured) ? configured : "+08:00";
  return new Date(`${value.replace(" ", "T")}${offset}`).toISOString();
}

function entryFromRow(row: EntryRow): ContentEntry {
  return {
    id: row.id,
    type: row.type,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    bodyMd: row.body_md,
    tags: parseArray(row.tags),
    status: row.status,
    coverMediaId: row.cover_media_id,
    imageIds: parseArray(row.image_ids),
    createdAt: iso(row.created_at)!,
    updatedAt: iso(row.updated_at)!,
    publishedAt: iso(row.published_at),
  };
}

const entryColumns = "id,type,slug,title,summary,body_md,tags,status,cover_media_id,image_ids,created_at,updated_at,published_at";

export async function listEntries(type: EntryType, includeDrafts = false): Promise<ContentEntry[]> {
  const [rows] = await getPool().query<EntryRow[]>(
    `SELECT ${entryColumns} FROM entries WHERE type = ? ${includeDrafts ? "" : "AND status = 'published'"} ORDER BY COALESCE(published_at, created_at) DESC, id DESC LIMIT 200`,
    [type],
  );
  return rows.map(entryFromRow);
}

export async function getEntryById(id: number): Promise<ContentEntry | null> {
  const [rows] = await getPool().query<EntryRow[]>(`SELECT ${entryColumns} FROM entries WHERE id = ? LIMIT 1`, [id]);
  return rows[0] ? entryFromRow(rows[0]) : null;
}

export async function getPublishedArticle(slug: string): Promise<ContentEntry | null> {
  const [rows] = await getPool().query<EntryRow[]>(
    `SELECT ${entryColumns} FROM entries WHERE slug = ? AND type = 'article' AND status = 'published' LIMIT 1`,
    [slug],
  );
  return rows[0] ? entryFromRow(rows[0]) : null;
}

export type EntryInput = Pick<ContentEntry, "type" | "slug" | "title" | "summary" | "bodyMd" | "tags" | "status" | "coverMediaId" | "imageIds" | "publishedAt">;

function publicationValue(input: EntryInput): Date | null {
  if (input.publishedAt) return new Date(input.publishedAt);
  return input.status === "published" ? new Date() : null;
}

export async function createEntry(input: EntryInput): Promise<ContentEntry> {
  const [result] = await getPool().execute<ResultSetHeader>(
    "INSERT INTO entries (type,slug,title,summary,body_md,tags,status,cover_media_id,image_ids,published_at) VALUES (?,?,?,?,?,?,?,?,?,?)",
    [input.type, input.slug, input.title, input.summary, input.bodyMd, JSON.stringify(input.tags), input.status,
      input.coverMediaId, JSON.stringify(input.imageIds), publicationValue(input)],
  );
  return (await getEntryById(result.insertId))!;
}

export async function updateEntry(id: number, input: EntryInput): Promise<ContentEntry | null> {
  const [result] = await getPool().execute<ResultSetHeader>(
    "UPDATE entries SET type=?,slug=?,title=?,summary=?,body_md=?,tags=?,status=?,cover_media_id=?,image_ids=?,published_at=? WHERE id=?",
    [input.type, input.slug, input.title, input.summary, input.bodyMd, JSON.stringify(input.tags), input.status,
      input.coverMediaId, JSON.stringify(input.imageIds), publicationValue(input), id],
  );
  return result.affectedRows ? getEntryById(id) : null;
}

export async function deleteEntry(id: number): Promise<boolean> {
  const [result] = await getPool().execute<ResultSetHeader>("DELETE FROM entries WHERE id=?", [id]);
  return result.affectedRows > 0;
}

export interface MediaRow extends RowDataPacket {
  id: string;
  name: string;
  mime: string;
  size_bytes: number;
  bytes: Buffer;
}

export async function insertMedia(id: string, name: string, mime: string, bytes: Buffer): Promise<void> {
  await getPool().execute("INSERT INTO media (id,name,mime,size_bytes,bytes) VALUES (?,?,?,?,?)", [id, name, mime, bytes.length, bytes]);
}

export async function getMedia(id: string): Promise<MediaRow | null> {
  const [rows] = await getPool().query<MediaRow[]>("SELECT id,name,mime,size_bytes,bytes FROM media WHERE id=? LIMIT 1", [id]);
  return rows[0] || null;
}
