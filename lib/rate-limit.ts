// lib/rate-limit.ts
// Simple in-memory sliding window rate limiter.
// Suitable for single-instance deployments (Vercel serverless resets on cold start, which is fine).

import { NextResponse } from "next/server";

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of Array.from(store.entries())) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

/**
 * Check rate limit for a given key.
 * Returns null if allowed, or a NextResponse 429 if over limit.
 */
export function rateLimit(
  key: string,
  { maxRequests, windowMs }: { maxRequests: number; windowMs: number },
): NextResponse | null {
  cleanup(windowMs);

  const now = Date.now();
  const cutoff = now - windowMs;
  const entry = store.get(key) ?? { timestamps: [] };

  // Drop timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= maxRequests) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  }

  entry.timestamps.push(now);
  store.set(key, entry);
  return null;
}
