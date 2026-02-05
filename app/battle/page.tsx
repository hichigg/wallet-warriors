import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { BattleArena } from "@/components/BattleArena";
import { getUserTotalPower } from "@/lib/battle";

export default async function BattlePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/battle");
  }

  const [user, recentBattles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        rankingPoints: true,
        _count: {
          select: {
            characters: true,
            battlesAsAttacker: true,
            battlesWon: true,
          },
        },
      },
    }),
    prisma.battle.findMany({
      where: {
        OR: [
          { attackerId: session.user.id },
          { defenderId: session.user.id },
        ],
      },
      include: {
        attacker: { select: { id: true, name: true } },
        defender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!user) {
    redirect("/auth/signin");
  }

  const userPower = await getUserTotalPower(session.user.id);
  const winRate = user._count.battlesAsAttacker > 0
    ? Math.round((user._count.battlesWon / user._count.battlesAsAttacker) * 100)
    : 0;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <PageHeader
          tag="Battle"
          title="Hostile Takeover Arena"
          subtitle="Your numbers versus their numbers. May the biggest spender win."
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatBox
            label="Ranking"
            value={user.rankingPoints.toLocaleString()}
            subtext="Ranking points"
            accent="text-purple-400"
          />
          <StatBox
            label="Total Power"
            value={userPower.toLocaleString()}
            subtext="All characters"
            accent="text-crunch"
          />
          <StatBox
            label="Battles"
            value={user._count.battlesAsAttacker.toString()}
            subtext="Initiated"
            accent="text-sky-400"
          />
          <StatBox
            label="Win Rate"
            value={`${winRate}%`}
            subtext={`${user._count.battlesWon} won`}
            accent="text-emerald-400"
          />
        </div>

        {/* Arena */}
        <div className="mb-10">
          <BattleArena
            userName={user.name ?? "Unknown"}
            userPower={userPower}
            userRanking={user.rankingPoints}
            hasCharacters={user._count.characters > 0}
          />
        </div>

        {/* Battle History */}
        {recentBattles.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                Battle Log
              </h2>
              <div className="h-px flex-1 bg-[#1a1a2e]" />
              <span className="text-[10px] font-mono text-slate-600">
                Last {recentBattles.length}
              </span>
            </div>

            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
              {recentBattles.map((b, i) => {
                const isAttacker = b.attackerId === session.user.id;
                const won = b.winnerId === session.user.id;
                const opponentName = isAttacker
                  ? (b.defender.name ?? "Unknown")
                  : (b.attacker.name ?? "Unknown");
                const myPower = isAttacker ? b.attackerPower : b.defenderPower;
                const theirPower = isAttacker ? b.defenderPower : b.attackerPower;
                const myRoll = isAttacker ? b.attackerRoll : b.defenderRoll;

                return (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i < recentBattles.length - 1 ? "border-b border-[#1a1a2e]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        won ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}>
                        <span className={`text-sm font-bold font-mono ${
                          won ? "text-emerald-400" : "text-red-400"
                        }`}>
                          {won ? "W" : "L"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 font-display font-bold">
                          vs {opponentName}
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono">
                          {b.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" "}&middot;{" "}
                          {isAttacker ? "Attacked" : "Defended"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[11px] font-mono text-slate-400">
                          {myPower.toLocaleString()}
                          <span className="text-slate-700"> ({myRoll !== null && myRoll !== undefined ? (myRoll >= 0 ? "+" : "") + myRoll : "?"})</span>
                          <span className="text-slate-600"> vs </span>
                          {theirPower.toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border ${
                        won
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                        {won ? `+${b.rankingPointsChange}` : `-${b.rankingPointsChange}`} RP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, subtext, accent }: { label: string; value: string; subtext: string; accent: string }) {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-5 text-center hover:border-[#2a2a3e] transition-colors">
      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
        {label}
      </p>
      <p className={`text-2xl font-black font-display ${accent}`}>{value}</p>
      <p className="text-[10px] text-slate-700 font-mono">{subtext}</p>
    </div>
  );
}
