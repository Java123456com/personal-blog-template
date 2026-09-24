import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { deleteEntry, getEntryById, updateEntry } from "@/lib/content/db";
import { apiError } from "@/lib/content/responses";
import { parseEntryInput } from "@/lib/content/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
const parseId = (id: string) => /^\d+$/.test(id) ? Number(id) : NaN;

export async function GET(request: NextRequest, context: Context) {
  if (!isAdmin(request)) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const id = parseId((await context.params).id);
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: "记录编号无效。" }, { status: 400 });
  try {
    const entry = await getEntryById(id);
    return entry ? NextResponse.json({ entry }, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "记录不存在。" }, { status: 404 });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: NextRequest, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  if (!isAdmin(request)) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const id = parseId((await context.params).id);
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: "记录编号无效。" }, { status: 400 });
  try {
    const input = parseEntryInput(await request.json());
    const entry = await updateEntry(id, input);
    return entry ? NextResponse.json({ entry }) : NextResponse.json({ error: "记录不存在。" }, { status: 404 });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && /无效|不能|需为|最多|缺少/.test(error.message)))
      return NextResponse.json({ error: error instanceof Error ? error.message : "请求格式无效。" }, { status: 400 });
    return apiError(error);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  if (!isAdmin(request)) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const id = parseId((await context.params).id);
  if (!Number.isSafeInteger(id)) return NextResponse.json({ error: "记录编号无效。" }, { status: 400 });
  try {
    return await deleteEntry(id) ? NextResponse.json({ deleted: true }) : NextResponse.json({ error: "记录不存在。" }, { status: 404 });
  } catch (error) { return apiError(error); }
}
