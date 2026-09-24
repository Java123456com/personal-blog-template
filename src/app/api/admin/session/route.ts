import { NextRequest, NextResponse } from "next/server";
import { adminConfigured, cookieOptions, createSession, isAdmin, sameOrigin, SESSION_COOKIE, validAdminPassword } from "@/lib/content/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; until: number }>();

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: isAdmin(request), configured: adminConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "请先配置管理员密码和会话密钥。" }, { status: 503 });
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const state = attempts.get(key);
  if (state && state.until > now && state.count >= 8) return NextResponse.json({ error: "尝试过多，请稍后再试。" }, { status: 429 });
  let password = "";
  try {
    const body = await request.json() as { password?: unknown };
    password = typeof body.password === "string" ? body.password.slice(0, 256) : "";
  } catch { return NextResponse.json({ error: "请求格式无效。" }, { status: 400 }); }
  if (!validAdminPassword(password)) {
    attempts.set(key, { count: (state && state.until > now ? state.count : 0) + 1, until: now + 10 * 60_000 });
    return NextResponse.json({ error: "密码不正确。" }, { status: 401 });
  }
  attempts.delete(key);
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(SESSION_COOKIE, createSession(), cookieOptions());
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "请求来源无效。" }, { status: 403 });
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}
