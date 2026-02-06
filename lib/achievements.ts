// lib/achievements.ts
// Achievement checking and granting system

import { prisma } from "./prisma";

export interface UnlockedAchievement {
  key: string;
  name: string;
  description: string;
  rewardCC: number;
  rewardTT: number;
  iconEmoji: string;
}

type AchievementChecker = (userId: string) => Promise<boolean>;

const ACHIEVEMENT_CHECKS: Record<string, AchievementChecker> = {
  first_pull: async (userId) => {
    const count = await prisma.userCharacter.count({ where: { userId } });
    return count >= 1;
  },

  collect_5: async (userId) => {
    const count = await prisma.userCharacter.count({ where: { userId } });
    return count >= 5;
  },

  collect_10: async (userId) => {
    const count = await prisma.userCharacter.count({ where: { userId } });
    return count >= 10;
  },

  collect_all: async (userId) => {
    const totalChars = await prisma.character.count();
    const owned = await prisma.userCharacter.count({ where: { userId } });
    return owned >= totalChars;
  },

  first_5star: async (userId) => {
    const has5Star = await prisma.userCharacter.findFirst({
      where: {
        userId,
        character: { rarity: 5 },
      },
    });
    return !!has5Star;
  },

  first_battle: async (userId) => {
    const wins = await prisma.battle.count({
      where: { winnerId: userId },
    });
    return wins >= 1;
  },

  win_10: async (userId) => {
    const wins = await prisma.battle.count({
      where: { winnerId: userId },
    });
    return wins >= 10;
  },

  win_50: async (userId) => {
    const wins = await prisma.battle.count({
      where: { winnerId: userId },
    });
    return wins >= 50;
  },

  pity_pull: async (userId) => {
    // Check if user has ever hit hard pity — pityCounter resets to 0 after a 5★
    // If they have a 5★ and their total pulls suggest they went to 100, they hit pity
    // Simpler: check if pityCounter ever reached 99+ (the pull that triggers hard pity)
    // We track this by checking if they own a 5★ — if pity was 99 and they pulled, it means they hit pity
    // For simplicity, we'll grant this if user's total pull count is >= 100
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { pityCounter: true },
    });
    // The pity counter resets on 5★, so if they have 5★ chars, they may have hit pity before
    // Best approximation: total characters owned + duplicates > 100
    const charCount = await prisma.userCharacter.count({ where: { userId } });
    const totalFedPower = await prisma.userCharacter.aggregate({
      where: { userId },
      _sum: { fedPower: true },
    });
    // Each duplicate adds to fedPower. Rough total pulls = charCount + sum(fedPower/avgBonus)
    const avgBonus = 50; // rough average
    const estimatedPulls = charCount + Math.floor((totalFedPower._sum.fedPower ?? 0) / avgBonus);
    return estimatedPulls >= 100;
  },

  whale_status: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { totalSpent: true },
    });
    return Number(user?.totalSpent ?? 0) >= 100;
  },
};

/**
 * Check all unearned achievements for a user and grant rewards for newly earned ones
 * Returns list of newly unlocked achievements
 */
export async function checkAchievements(userId: string): Promise<UnlockedAchievement[]> {
  // Get all achievements
  const allAchievements = await prisma.achievement.findMany();

  // Get user's already-earned achievements
  const earned = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const earnedIds = new Set(earned.map((e) => e.achievementId));

  // Check unearned achievements
  const newlyUnlocked: UnlockedAchievement[] = [];

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    const checker = ACHIEVEMENT_CHECKS[achievement.key];
    if (!checker) continue;

    const isEarned = await checker(userId);
    if (!isEarned) continue;

    // Grant the achievement and rewards
    await prisma.$transaction(async (tx) => {
      await tx.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Grant CC reward
      if (achievement.rewardCC > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { crunchCoin: { increment: achievement.rewardCC } },
        });
      }

      // Grant TT reward
      if (achievement.rewardTT > 0) {
        await tx.user.update({
          where: { id: userId },
          data: { trickleTokens: { increment: achievement.rewardTT } },
        });
      }
    });

    newlyUnlocked.push({
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      rewardCC: achievement.rewardCC,
      rewardTT: achievement.rewardTT,
      iconEmoji: achievement.iconEmoji,
    });
  }

  return newlyUnlocked;
}
