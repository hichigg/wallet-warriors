import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { checkAchievements } from "@/lib/achievements";
import { logger } from "@/lib/logger";

export async function POST() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const newAchievements = await checkAchievements(session.user.id);

    return NextResponse.json({
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    logger.error("Achievement check error:", error);
    return NextResponse.json(
      { error: "Failed to check achievements" },
      { status: 500 }
    );
  }
}
