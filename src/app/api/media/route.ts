import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { insertMedia } from "@/lib/content/db";
import { apiError } from "@/lib/content/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function detectedMime(bytes: Buffer): string | null {
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  if (["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6))) return "image/gif";
  return null;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  if (!isAdmin(request)) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_IMAGE_BYTES + 100_000) return NextResponse.json({ error: "图片不能超过 5 MB。" }, { status: 413 });
  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File) file = value;
  } catch { return NextResponse.json({ error: "上传数据无效。" }, { status: 400 }); }
  if (!file || file.size === 0 || file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "请选择不超过 5 MB 的图片。" }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const mime = detectedMime(bytes);
  if (!mime) return NextResponse.json({ error: "仅支持 JPEG、PNG、WebP 和 GIF 图片。" }, { status: 400 });
  const id = randomUUID();
  try {
    await insertMedia(id, file.name.slice(0, 255), mime, bytes);
    return NextResponse.json({ id, url: `/api/media/${id}`, name: file.name, size: bytes.length }, { status: 201 });
  } catch (error) { return apiError(error); }
}
