import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CharacterCard } from "@/components/CharacterCard";

export default async function CollectionPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/collection");
  }

  // Fetch user's characters with character details
  const userCharacters = await prisma.userCharacter.findMany({
    where: { userId: session.user.id },
    include: {
      character: true,
    },
    orderBy: [
      { character: { rarity: "desc" } },
      { character: { name: "asc" } },
    ],
  });

  // Get total character count for completion percentage
  const totalCharacters = await prisma.character.count();
  const ownedCount = userCharacters.length;
  const completionPercent = totalCharacters > 0
    ? Math.round((ownedCount / totalCharacters) * 100)
    : 0;

  // Calculate total power
  const totalPower = userCharacters.reduce((sum, uc) => {
    return sum + uc.character.basePower + uc.fedPower;
  }, 0);

  // Group by rarity for stats
  const rarityStats = [1, 2, 3, 4, 5].map((rarity) => ({
    rarity,
    owned: userCharacters.filter((uc) => uc.character.rarity === rarity).length,
    total: 0, // Will be filled below
  }));

  // Get total per rarity
  const totalByRarity = await prisma.character.groupBy({
    by: ["rarity"],
    _count: { id: true },
  });

  for (const t of totalByRarity) {
    const stat = rarityStats.find((s) => s.rarity === t.rarity);
    if (stat) stat.total = t._count.id;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader
        tag="Collection"
        title="Your Assets Under Mismanagement"
        subtitle="Each character represents a questionable investment decision."
      />

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatBox
          label="Collected"
          value={`${ownedCount}/${totalCharacters}`}
          subtext={`${completionPercent}% complete`}
        />
        <StatBox
          label="Total Power"
          value={totalPower.toLocaleString()}
          subtext="Combined strength"
        />
        <StatBox
          label="Rarest Pull"
          value={
            userCharacters.length > 0
              ? "★".repeat(Math.max(...userCharacters.map((uc) => uc.character.rarity)))
              : "—"
          }
          subtext="Best character"
        />
        <StatBox
          label="Fed Power"
          value={userCharacters.reduce((sum, uc) => sum + uc.fedPower, 0).toLocaleString()}
          subtext="From spending"
        />
      </div>

      {/* Rarity Progress */}
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4 mb-8">
        <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
          Collection Progress by Rarity
        </h3>
        <div className="flex flex-wrap gap-4">
          {rarityStats.map(({ rarity, owned, total }) => (
            <div key={rarity} className="flex items-center gap-2">
              <span className={`text-sm ${getRarityColor(rarity)}`}>
                {"★".repeat(rarity)}
              </span>
              <span className="text-sm text-slate-400 font-mono">
                {owned}/{total}
              </span>
              {owned === total && total > 0 && (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-mono">
                  COMPLETE
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Character Grid */}
      {userCharacters.length === 0 ? (
        <EmptyCollection />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {userCharacters.map((uc) => (
            <CharacterCard
              key={uc.id}
              character={uc.character}
              fedPower={uc.fedPower}
              acquiredAt={uc.acquiredAt}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-ww-surface border border-ww-border rounded-xl p-4 text-center">
      <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-100 font-display">{value}</p>
      <p className="text-[11px] text-slate-600 font-mono">{subtext}</p>
    </div>
  );
}

function EmptyCollection() {
  return (
    <div className="bg-ww-surface/50 border border-dashed border-slate-800 rounded-2xl px-10 py-20 text-center">
      <div className="text-6xl mb-4">🃏</div>
      <h3 className="text-xl font-bold text-slate-300 font-display mb-2">
        No Characters Yet
      </h3>
      <p className="text-sm text-slate-500 font-body mb-6 max-w-md mx-auto">
        Your portfolio is looking a bit empty. Time to make some questionable
        financial decisions at the gacha.
      </p>
      <Link
        href="/gacha"
        className="inline-block px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-semibold rounded-xl transition-all duration-200"
      >
        Pull Characters
      </Link>
    </div>
  );
}

function getRarityColor(rarity: number): string {
  switch (rarity) {
    case 5:
      return "text-amber-400";
    case 4:
      return "text-purple-400";
    case 3:
      return "text-blue-400";
    case 2:
      return "text-green-400";
    default:
      return "text-slate-400";
  }
}
