import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter
// For production use a Redis-backed solution like @upstash/ratelimit
const requestCounts = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

function getRateLimitKey(req: NextRequest): string {
  // Use forwarded IP or fallback to a generic key
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

export function middleware(req: NextRequest) {
  // Only rate limit API routes
  if (!req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const key = getRateLimitKey(req);
  const now = Date.now();
  const entry = requestCounts.get(key);

  if (!entry || now > entry.resetAt) {
    // New window
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
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(RATE_LIMIT_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(entry.resetAt),
        },
      }
    );
  }

  entry.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};