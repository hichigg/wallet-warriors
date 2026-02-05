import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const session = await getSession();

    // Get all buzzwords
    const buzzwords = await prisma.buzzword.findMany({
      orderBy: { cost: "asc" },
    });

    // If logged in, also get user's inventory
    let inventory: Record<string, number> = {};
    let crunchCoin = 0;

    if (session?.user?.id) {
      const [userBuzzwords, user] = await Promise.all([
        prisma.userBuzzword.findMany({
          where: { userId: session.user.id },
          select: { buzzwordId: true, quantity: true },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { crunchCoin: true },
        }),
      ]);

      for (const ub of userBuzzwords) {
        inventory[ub.buzzwordId] = ub.quantity;
      }
      crunchCoin = user?.crunchCoin ?? 0;
    }

    return NextResponse.json({
      buzzwords: buzzwords.map((bw) => ({
        id: bw.id,
        name: bw.name,
        cost: bw.cost,
        effect: bw.effect,
        description: bw.description,
        owned: inventory[bw.id] ?? 0,
      })),
      crunchCoin,
    });
  } catch (error) {
    logger.error("Buzzwords list error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
