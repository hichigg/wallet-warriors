import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { buyBuzzword } from "@/lib/buzzwords";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(`buzzword:${session.user.id}`, { maxRequests: 20, windowMs: 60_000 });
    if (limited) return limited;

    const body = await req.json().catch(() => null);
    const buzzwordId = body?.buzzwordId;

    if (!buzzwordId || typeof buzzwordId !== "string") {
      return NextResponse.json({ error: "buzzwordId is required" }, { status: 400 });
    }

    const result = await buyBuzzword(session.user.id, buzzwordId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Buzzword buy error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
