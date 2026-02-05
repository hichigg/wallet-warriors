// lib/leaderboard.ts
// Leaderboard queries — multiple ranking categories
// The leaderboard openly shows total $ spent. This is by design.

import { prisma } from "./prisma";

export type LeaderboardCategory =
  | "ranking"     // Ranking points (battle performance)
  | "spending"    // Total $ spent (the real leaderboard)
  | "power"       // Total power across all characters
  | "collection"; // Number of unique characters owned

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string | null;
  username: string | null;
  image: string | null;
  value: number;
  /** Secondary stat shown alongside the primary value */
  secondary: number;
}

export interface LeaderboardData {
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
  totalPlayers: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 500;

export async function getLeaderboard(
  category: LeaderboardCategory = "ranking",
  limit: number = DEFAULT_LIMIT,
): Promise<LeaderboardData> {
  const take = Math.min(Math.max(1, limit), MAX_LIMIT);

  switch (category) {
    case "ranking":
      return getRankingLeaderboard(take);
    case "spending":
      return getSpendingLeaderboard(take);
    case "power":
      return getPowerLeaderboard(take);
    case "collection":
      return getCollectionLeaderboard(take);
    default:
      return getRankingLeaderboard(take);
  }
}

async function getRankingLeaderboard(take: number): Promise<LeaderboardData> {
  const [users, totalPlayers] = await Promise.all([
    prisma.user.findMany({
      where: { rankingPoints: { gt: 0 } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        rankingPoints: true,
        totalSpent: true,
      },
      orderBy: { rankingPoints: "desc" },
      take,
    }),
    prisma.user.count({ where: { rankingPoints: { gt: 0 } } }),
  ]);

  return {
    category: "ranking",
    entries: users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      username: u.username,
      image: u.image,
      value: u.rankingPoints,
      secondary: Number(u.totalSpent),
    })),
    totalPlayers,
  };
}

async function getSpendingLeaderboard(take: number): Promise<LeaderboardData> {
  const [users, totalPlayers] = await Promise.all([
    prisma.user.findMany({
      where: { totalSpent: { gt: 0 } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalSpent: true,
        rankingPoints: true,
      },
      orderBy: { totalSpent: "desc" },
      take,
    }),
    prisma.user.count({ where: { totalSpent: { gt: 0 } } }),
  ]);

  return {
    category: "spending",
    entries: users.map((u, i) => ({
      rank: i + 1,
      userId: u.id,
      name: u.name,
      username: u.username,
      image: u.image,
      value: Number(u.totalSpent),
      secondary: u.rankingPoints,
    })),
    totalPlayers,
  };
}

async function getPowerLeaderboard(take: number): Promise<LeaderboardData> {
  // Aggregate total power per user (basePower + fedPower across all characters)
  const powerData = await prisma.userCharacter.groupBy({
    by: ["userId"],
    _sum: { fedPower: true },
    orderBy: { _sum: { fedPower: "desc" } },
  });

  // Get character base powers to add
  const userIds = powerData.map((p) => p.userId);
  const [users, characters] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalSpent: true,
      },
    }),
    prisma.userCharacter.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, fedPower: true, character: { select: { basePower: true } } },
    }),
  ]);

  // Sum total power per user
  const powerMap = new Map<string, number>();
  for (const uc of characters) {
    const current = powerMap.get(uc.userId) ?? 0;
    powerMap.set(uc.userId, current + uc.character.basePower + uc.fedPower);
  }

  const userMap = new Map(users.map((u) => [u.id, u]));

  const sorted = Array.from(powerMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, take);

  const totalPlayers = powerMap.size;

  return {
    category: "power",
    entries: sorted.map(([userId, power], i) => {
      const u = userMap.get(userId);
      return {
        rank: i + 1,
        userId,
        name: u?.name ?? null,
        username: u?.username ?? null,
        image: u?.image ?? null,
        value: power,
        secondary: Number(u?.totalSpent ?? 0),
      };
    }),
    totalPlayers,
  };
}

async function getCollectionLeaderboard(take: number): Promise<LeaderboardData> {
  const collectionData = await prisma.userCharacter.groupBy({
    by: ["userId"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take,
  });

  const userIds = collectionData.map((c) => c.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      totalSpent: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));
  const totalPlayers = collectionData.length;

  return {
    category: "collection",
    entries: collectionData.map((c, i) => {
      const u = userMap.get(c.userId);
      return {
        rank: i + 1,
        userId: c.userId,
        name: u?.name ?? null,
        username: u?.username ?? null,
        image: u?.image ?? null,
        value: c._count.id,
        secondary: Number(u?.totalSpent ?? 0),
      };
    }),
    totalPlayers,
  };
}

/** Get a specific user's rank in a category */
export async function getUserRank(
  userId: string,
  category: LeaderboardCategory = "ranking",
): Promise<number | null> {
  const leaderboard = await getLeaderboard(category, MAX_LIMIT);
  const entry = leaderboard.entries.find((e) => e.userId === userId);
  return entry?.rank ?? null;
}
