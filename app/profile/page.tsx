import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Profile | Wallet Warriors",
  description: "Your warrior profile. Stats, spending history, and badges of financial shame.",
};
import { YourRank } from "@/components/YourRank";
import { UsernameForm } from "./UsernameForm";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          characters: true,
          battlesAsAttacker: true,
          battlesWon: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const winRate =
    user._count.battlesAsAttacker > 0
      ? Math.round((user._count.battlesWon / user._count.battlesAsAttacker) * 100)
      : 0;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <PageHeader
          tag="Profile"
          title="Shareholder Profile"
          subtitle="Your permanent record of financial decisions."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Info */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-6">
                {user.image ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-crunch/20 rounded-full blur-xl" />
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      width={96}
                      height={96}
                      className="relative rounded-full border-2 border-crunch/30 mb-4"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#111120] border-2 border-[#2a2a3e] mb-4 flex items-center justify-center">
                    <span className="text-3xl">💸</span>
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-100 font-display">
                  {user.name || "Anonymous Whale"}
                </h2>
                <p className="text-[11px] text-slate-600 font-mono">{user.email}</p>

                {user.username ? (
                  <div className="mt-3 px-3 py-1 bg-crunch-bg border border-crunch-border rounded-lg">
                    <span className="text-[12px] font-mono text-crunch">
                      @{user.username}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 px-3 py-1 bg-[#111120] border border-[#1a1a2e] rounded-lg">
                    <span className="text-[12px] font-mono text-slate-600">
                      No username set
                    </span>
                  </div>
                )}
              </div>

              <UsernameForm currentUsername={user.username} />

              <div className="mt-6 pt-6 border-t border-[#1a1a2e]">
                <p className="text-[10px] text-slate-700 font-mono text-center uppercase tracking-wider">
                  Bag holder since{" "}
                  {user.createdAt.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Stats */}
          <div className="lg:col-span-2 space-y-5">
            {/* Currency Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                    CrunchCoin
                  </span>
                </div>
                <p className="text-3xl font-black font-mono text-crunch">
                  {user.crunchCoin.toLocaleString()}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 border border-green-500/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em]">
                    Trickle Tokens
                  </span>
                </div>
                <p className="text-3xl font-black font-mono text-trickle">
                  {user.trickleTokens.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Financial Damage Report */}
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-5">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
                  Financial Damage Report
                </h3>
                <div className="h-px flex-1 bg-[#1a1a2e]" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <MiniStat label="Total Spent" value={`$${Number(user.totalSpent).toFixed(2)}`} subtext="Real money" accent="text-red-400" />
                <MiniStat label="Ranking Pts" value={user.rankingPoints.toLocaleString()} subtext="Leaderboard" accent="text-purple-400" />
                <MiniStat label="Pity Counter" value={`${user.pityCounter}/100`} subtext="Until 5★" accent="text-sky-400" />
                <MiniStat label="Login Streak" value={`${user.loginStreak}d`} subtext="Consecutive" accent="text-trickle" />
              </div>
            </div>

            {/* Collection & Battle Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatTile icon="🃏" value={user._count.characters} label="Characters" />
              <StatTile icon="⚔️" value={user._count.battlesAsAttacker} label="Battles Fought" />
              <StatTile icon="🏆" value={`${winRate}%`} label="Win Rate" />
            </div>

            {/* Your Rankings */}
            <YourRank userId={session.user.id} />

            {/* Warning */}
            <div className="bg-red-500/[0.04] border border-red-500/10 rounded-xl p-4">
              <p className="text-[10px] text-red-400/60 font-mono text-center uppercase tracking-wider">
                This data is permanently stored and will be used against you on the leaderboard
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, subtext, accent }: { label: string; value: string; subtext: string; accent: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em] mb-1">
        {label}
      </p>
      <p className={`text-xl font-black font-display ${accent}`}>{value}</p>
      <p className="text-[9px] text-slate-700 font-mono">{subtext}</p>
    </div>
  );
}

function StatTile({ icon, value, label }: { icon: string; value: number | string; label: string }) {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-xl p-5 hover:border-[#2a2a3e] transition-colors">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-black text-slate-100 font-display">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wider">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
