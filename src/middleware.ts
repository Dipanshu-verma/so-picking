import { NextRequest, NextResponse } from "next/server";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;

function getRateLimitKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0].trim() : "unknown";
}

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const key = getRateLimitKey(req);
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many requests. Please slow down.",
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      },
      { status: 429 }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};