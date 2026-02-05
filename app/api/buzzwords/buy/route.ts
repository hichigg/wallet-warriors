import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { buyBuzzword } from "@/lib/buzzwords";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
}
