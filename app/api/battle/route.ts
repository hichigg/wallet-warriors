import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { executeBattle } from "@/lib/battle";

export async function POST() {
  // 1. Auth check
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Execute battle (matchmaking + resolution)
  const result = await executeBattle(session.user.id);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result);
}
