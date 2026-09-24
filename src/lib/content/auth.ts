import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE = "personal_blog_admin";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

function configuredSecret(): string | null {
  const secret = process.env.BLOG_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.BLOG_ADMIN_PASSWORD && configuredSecret());
}

function equalSecret(a: string, b: string): boolean {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function validAdminPassword(password: string): boolean {
  return adminConfigured() && equalSecret(password, process.env.BLOG_ADMIN_PASSWORD!);
}

function signature(expires: string): string {
  return createHmac("sha256", configuredSecret()!).update(expires).digest("hex");
}

export function createSession(): string {
  const expires = String(Math.floor(Date.now() / 1000) + SESSION_SECONDS);
  return `${expires}.${signature(expires)}`;
}

export function isAdmin(request: NextRequest): boolean {
  if (!adminConfigured()) return false;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  const [expires, supplied] = token.split(".");
  if (!expires || !supplied || !/^\d+$/.test(expires) || Number(expires) < Date.now() / 1000) return false;
  return equalSecret(supplied, signature(expires));
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.BLOG_COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  };
}

export function sameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
