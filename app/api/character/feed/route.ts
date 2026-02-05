import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { executeFeed } from "@/lib/feed";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = rateLimit(`feed:${session.user.id}`, { maxRequests: 20, windowMs: 60_000 });
    if (limited) return limited;

    // 2. Validate body
    let body: { userCharacterId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    if (!body.userCharacterId || typeof body.userCharacterId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid userCharacterId." },
        { status: 400 },
      );
    }

    // 3. Execute feed
    const result = await executeFeed(session.user.id, body.userCharacterId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Character feed error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
