import { redirect } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { UsernameForm } from "./UsernameForm";

export default async function ProfilePage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  // Fetch full user data from database
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
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader
        tag="Profile"
        title="Shareholder Profile"
        subtitle="Your permanent record of financial decisions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Info */}
        <div className="lg:col-span-1">
          <div className="bg-ww-surface border border-ww-border rounded-2xl p-6">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center mb-6">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "Profile"}
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-amber-500/30 mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-4 border-slate-600 mb-4 flex items-center justify-center">
                  <span className="text-3xl">💸</span>
                </div>
              )}
              <h2 className="text-xl font-bold text-slate-100 font-display">
                {user.name || "Anonymous Whale"}
              </h2>
              <p className="text-sm text-slate-500 font-mono">{user.email}</p>

              {/* Username badge */}
              {user.username ? (
                <div className="mt-3 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <span className="text-sm font-mono text-amber-400">
                    @{user.username}
                  </span>
                </div>
              ) : (
                <div className="mt-3 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg">
                  <span className="text-sm font-mono text-slate-500">
                    No username set
                  </span>
                </div>
              )}
            </div>

            {/* Username Form */}
            <UsernameForm currentUsername={user.username} />

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t border-ww-border">
              <p className="text-[11px] text-slate-600 font-mono text-center">
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
        <div className="lg:col-span-2 space-y-6">
          {/* Currency Stats */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="CrunchCoin"
              value={user.crunchCoin.toLocaleString()}
              icon="🪙"
              color="amber"
            />
            <StatCard
              label="Trickle Tokens"
              value={user.trickleTokens.toLocaleString()}
              icon="💧"
              color="green"
            />
          </div>

          {/* Financial Stats */}
          <div className="bg-ww-surface border border-ww-border rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 font-mono">
              Financial Damage Report
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat
                label="Total Spent"
                value={`$${Number(user.totalSpent).toFixed(2)}`}
                subtext="Real money"
              />
              <MiniStat
                label="Ranking Points"
                value={user.rankingPoints.toLocaleString()}
                subtext="Leaderboard"
              />
              <MiniStat
                label="Pity Counter"
                value={`${user.pityCounter}/100`}
                subtext="Until 5★ guarantee"
              />
              <MiniStat
                label="Login Streak"
                value={`${user.loginStreak} days`}
                subtext="Consecutive"
              />
            </div>
          </div>

          {/* Collection & Battle Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🃏</span>
                <div>
                  <p className="text-2xl font-bold text-slate-100 font-display">
                    {user._count.characters}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Characters Owned
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⚔️</span>
                <div>
                  <p className="text-2xl font-bold text-slate-100 font-display">
                    {user._count.battlesAsAttacker}
                  </p>
                  <p className="text-xs text-slate-500 font-mono">
                    Battles Fought
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ww-surface border border-ww-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="text-2xl font-bold text-slate-100 font-display">
                    {winRate}%
                  </p>
                  <p className="text-xs text-slate-500 font-mono">Win Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Satirical Warning */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-red-400/80 font-mono text-center">
              ⚠️ This data is permanently stored and will be used against you in
              the court of public opinion (the leaderboard).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Stat Card Component ---
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: "amber" | "green";
}) {
  const colorClasses = {
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    green: "from-green-500/20 to-green-600/10 border-green-500/30",
  };
  const textClasses = {
    amber: "text-amber-400",
    green: "text-green-400",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className={`text-3xl font-bold font-display ${textClasses[color]}`}>
        {value}
      </p>
    </div>
  );
}

// --- Mini Stat Component ---
function MiniStat({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-slate-500 font-mono uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-100 font-display">{value}</p>
      <p className="text-[10px] text-slate-600 font-mono">{subtext}</p>
    </div>
  );
}
