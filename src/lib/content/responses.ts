import { NextResponse } from "next/server";

export function apiError(error: unknown): NextResponse {
  if (error instanceof Error && (error.message.startsWith("MySQL 尚未配置") || error.message.includes("ECONNREFUSED"))) {
    return NextResponse.json({ error: "MySQL 未连接，请检查数据库配置与服务状态。" }, { status: 503 });
  }
  if (error instanceof Error && "code" in error && error.code === "ER_DUP_ENTRY") {
    return NextResponse.json({ error: "链接标识已存在，请换一个。" }, { status: 409 });
  }
  console.error("Content API error", error);
  return NextResponse.json({ error: "内容服务暂时不可用。" }, { status: 500 });
}
