import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { FeedButton } from "@/components/FeedButton";
import {
  getNextFeedCost,
  getFeedLevel,
  getFeedLevelName,
  isMaxFedPower,
  BASE_FEED_COST,
  MAX_FED_POWER,
  POWER_PER_FEED,
} from "@/lib/feed";
import { getCharacterEmoji } from "@/lib/character-meta";

const RARITY_CONFIG: Record<number, { label: string; stars: string; text: string; gradient: string; accentLine: string; border: string }> = {
  5: { label: "LEGENDARY", stars: "\u2605\u2605\u2605\u2605\u2605", text: "text-amber-400", gradient: "from-amber-500/20 via-yellow-500/5 to-amber-600/20", accentLine: "bg-amber-500", border: "border-amber-500/40" },
  4: { label: "SUPER RARE", stars: "\u2605\u2605\u2605\u2605\u2606", text: "text-purple-400", gradient: "from-purple-500/20 via-fuchsia-500/5 to-purple-600/20", accentLine: "bg-purple-500", border: "border-purple-500/40" },
  3: { label: "RARE", stars: "\u2605\u2605\u2605\u2606\u2606", text: "text-blue-400", gradient: "from-blue-500/15 via-cyan-500/5 to-blue-600/15", accentLine: "bg-blue-500", border: "border-blue-500/30" },
  2: { label: "UNCOMMON", stars: "\u2605\u2605\u2606\u2606\u2606", text: "text-green-400", gradient: "from-green-500/15 via-emerald-500/5 to-green-600/15", accentLine: "bg-green-500", border: "border-green-500/30" },
  1: { label: "COMMON", stars: "\u2605\u2606\u2606\u2606\u2606", text: "text-slate-400", gradient: "from-slate-500/15 via-slate-400/5 to-slate-600/15", accentLine: "bg-slate-500", border: "border-slate-500/25" },
};


export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/collection/${id}`);
  }

  const [userCharacter, currentUser] = await Promise.all([
    prisma.userCharacter.findUnique({
      where: { id },
      include: { character: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { crunchCoin: true },
    }),
  ]);

  if (!userCharacter || userCharacter.userId !== session.user.id) {
    notFound();
  }

  const { character } = userCharacter;
  const rarity = character.rarity;
  const config = RARITY_CONFIG[rarity] ?? RARITY_CONFIG[1];
  const totalPower = character.basePower + userCharacter.fedPower;
  const userCrunchCoin = currentUser?.crunchCoin ?? 0;
  const maxPower = MAX_FED_POWER[rarity] ?? 100;
  const perFeed = POWER_PER_FEED[rarity] ?? 5;
  const baseCost = BASE_FEED_COST[rarity] ?? 25;
  const feedLevel = getFeedLevel(userCharacter.fedPower, rarity);
  const feedLevelName = getFeedLevelName(userCharacter.fedPower, rarity);
  const nextCost = getNextFeedCost(userCharacter.fedPower, rarity);
  const isMaxed = isMaxFedPower(userCharacter.fedPower, rarity);
  const totalFeedsToMax = Math.ceil(maxPower / perFeed);
  const feedsRemaining = totalFeedsToMax - feedLevel;
  const emoji = getCharacterEmoji(character.name);

  // Calculate total CC remaining to max
  let ccToMax = 0;
  for (let i = feedLevel; i < totalFeedsToMax; i++) {
    ccToMax += baseCost * (i + 1);
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-600 hover:text-slate-400 uppercase tracking-wider mb-8 transition-colors"
        >
          <span>&larr;</span> Back to Collection
        </Link>

        {/* Main card */}
        <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-b from-[#111120] to-[#0c0c18] ${config.border}`}>
          {/* Top accent line */}
          <div className={`h-[2px] w-full ${config.accentLine} opacity-60`} />

          {/* Rarity strip */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className={`text-[10px] font-mono font-bold tracking-[0.2em] uppercase ${config.text}`}>
              {config.label}
            </span>
            <span className={`text-sm ${config.text} opacity-70`}>{config.stars}</span>
          </div>

          <div className="px-6 pb-8">
            {/* Hero section: avatar + info side by side on md+ */}
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mb-8">
              {/* Large Avatar */}
              <div className={`w-full md:w-64 aspect-square rounded-xl bg-gradient-to-br ${config.gradient} border border-white/[0.06] flex items-center justify-center flex-shrink-0`}>
                <span className="text-8xl opacity-70">{emoji}</span>
              </div>

              {/* Character info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-50 font-display tracking-tight leading-tight mb-3">
                  {character.name}
                </h1>

                {/* Power display */}
                <div className="flex items-baseline gap-3 mb-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Total PWR</span>
                    <span className={`text-3xl font-black font-mono ${config.text}`}>
                      {totalPower.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Power breakdown */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <div className="bg-[#0f0f19] border border-[#1a1a2e] rounded-lg px-3 py-2">
                    <p className="text-[8px] font-mono text-slate-700 uppercase tracking-wider mb-0.5">Base</p>
                    <p className="text-sm font-bold font-mono text-slate-300">{character.basePower}</p>
                  </div>
                  <div className="bg-[#0f0f19] border border-[#1a1a2e] rounded-lg px-3 py-2">
                    <p className="text-[8px] font-mono text-slate-700 uppercase tracking-wider mb-0.5">Fed</p>
                    <p className="text-sm font-bold font-mono text-crunch">+{userCharacter.fedPower}</p>
                  </div>
                  <div className="bg-[#0f0f19] border border-[#1a1a2e] rounded-lg px-3 py-2">
                    <p className="text-[8px] font-mono text-slate-700 uppercase tracking-wider mb-0.5">Feed Lvl</p>
                    <p className="text-sm font-bold font-mono text-slate-300">{feedLevel}</p>
                  </div>
                  <div className="bg-[#0f0f19] border border-[#1a1a2e] rounded-lg px-3 py-2">
                    <p className="text-[8px] font-mono text-slate-700 uppercase tracking-wider mb-0.5">Status</p>
                    <p className="text-sm font-bold font-mono text-slate-300">{feedLevelName}</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-[13px] text-slate-400/80 font-body leading-relaxed">
                  {character.bio}
                </p>

                {/* Acquired date */}
                <p className="mt-3 text-[9px] text-slate-700 font-mono uppercase tracking-wider">
                  Acquired {new Date(userCharacter.acquiredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            {/* Feed Section */}
            <div className="bg-[#0a0a16] border border-[#1a1a2e] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                  Power Up
                </h2>
                <div className="h-px flex-1 bg-[#1a1a2e]" />
                <span className="text-[10px] font-mono text-crunch/70">
                  {userCrunchCoin.toLocaleString()} CC available
                </span>
              </div>

              {/* Feed button component */}
              <FeedButton
                userCharacterId={userCharacter.id}
                currentFedPower={userCharacter.fedPower}
                maxFedPower={maxPower}
                nextCost={nextCost}
                powerPerFeed={perFeed}
                feedLevel={feedLevel}
                feedLevelName={feedLevelName}
                userCrunchCoin={userCrunchCoin}
                rarity={rarity}
              />

              {/* Cost breakdown */}
              {!isMaxed && (
                <div className="mt-4 pt-4 border-t border-[#1a1a2e]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Next feed</span>
                      <span className="text-[10px] font-mono text-slate-500">{nextCost} CC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Power gain</span>
                      <span className="text-[10px] font-mono text-slate-500">+{perFeed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Feeds left</span>
                      <span className="text-[10px] font-mono text-slate-500">{feedsRemaining}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">CC to max</span>
                      <span className="text-[10px] font-mono text-crunch/70">{ccToMax.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] font-mono text-slate-800 italic text-center">
                    Each feed costs more than the last. This is by design. You&apos;re welcome.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
