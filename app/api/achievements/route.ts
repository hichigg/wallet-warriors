import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all achievements with user's unlock status
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
    });

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    const achievements = allAchievements.map((a) => ({
      id: a.id,
      key: a.key,
      name: a.name,
      description: a.description,
      rewardCC: a.rewardCC,
      rewardTT: a.rewardTT,
      iconEmoji: a.iconEmoji,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) ?? null,
    }));

    return NextResponse.json({ achievements });
  } catch (error) {
    logger.error("Achievements fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
