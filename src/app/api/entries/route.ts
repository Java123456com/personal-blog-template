import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { createEntry, listEntries } from "@/lib/content/db";
import { apiError } from "@/lib/content/responses";
import { parseEntryInput } from "@/lib/content/validation";
import type { EntryType } from "@/lib/content/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  if (type !== "article" && type !== "moment") return NextResponse.json({ error: "内容类型无效。" }, { status: 400 });
  const all = request.nextUrl.searchParams.get("all") === "1";
  if (all && !isAdmin(request)) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  try {
    const entries = await listEntries(type as EntryType, all);
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  if (!isAdmin(request)) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  try {
    const input = parseEntryInput(await request.json());
    const entry = await createEntry(input);
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && /无效|不能|需为|最多|缺少/.test(error.message)))
      return NextResponse.json({ error: error instanceof Error ? error.message : "请求格式无效。" }, { status: 400 });
    return apiError(error);
  }
}
