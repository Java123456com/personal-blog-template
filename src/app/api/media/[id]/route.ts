import { NextResponse } from "next/server";
import { getMedia } from "@/lib/content/db";
import { apiError } from "@/lib/content/responses";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new NextResponse(null, { status: 404 });
  try {
    const media = await getMedia(id);
    if (!media) return new NextResponse(null, { status: 404 });
    return new NextResponse(new Uint8Array(media.bytes), {
      headers: {
        "Content-Type": media.mime,
        "Content-Length": String(media.size_bytes),
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) { return apiError(error); }
}
