import { NextResponse } from "next/server";

// Standard API response envelopes so every route returns a predictable shape.
//   success: { data, meta? }
//   error:   { error, code }

export function ok<T>(data: T, meta?: Record<string, unknown>, status = 200) {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status });
}

export function fail(message: string, code: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

export const errors = {
  unauthorized: () => fail("请先登录", "UNAUTHORIZED", 401),
  forbidden: () => fail("没有权限", "FORBIDDEN", 403),
  notFound: (what = "资源") => fail(`${what}不存在`, "NOT_FOUND", 404),
  badRequest: (msg = "请求参数有误") => fail(msg, "BAD_REQUEST", 400),
  conflict: (msg = "资源已存在") => fail(msg, "CONFLICT", 409),
  server: (msg = "服务器错误") => fail(msg, "INTERNAL_ERROR", 500),
};
