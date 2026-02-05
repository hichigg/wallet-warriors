import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { executeBattle } from "@/lib/battle";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(`battle:${session.user.id}`, { maxRequests: 15, windowMs: 60_000 });
    if (limited) return limited;

    // 2. Parse optional buzzwordId
    const body = await req.json().catch(() => ({}));
    const buzzwordId = typeof body?.buzzwordId === "string" ? body.buzzwordId : undefined;

    // 3. Execute battle (matchmaking + resolution + optional buzzword)
    const result = await executeBattle(session.user.id, buzzwordId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Battle error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
