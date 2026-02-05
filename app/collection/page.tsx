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

  const userCharacters = await prisma.userCharacter.findMany({
    where: { userId: session.user.id },
    include: { character: true },
    orderBy: [
      { character: { rarity: "desc" } },
      { character: { name: "asc" } },
    ],
  });

  const totalCharacters = await prisma.character.count();
  const ownedCount = userCharacters.length;
  const completionPercent = totalCharacters > 0
    ? Math.round((ownedCount / totalCharacters) * 100)
    : 0;

  const totalPower = userCharacters.reduce((sum, uc) => {
    return sum + uc.character.basePower + uc.fedPower;
  }, 0);

  const rarityStats = [1, 2, 3, 4, 5].map((rarity) => ({
    rarity,
    owned: userCharacters.filter((uc) => uc.character.rarity === rarity).length,
    total: 0,
  }));

  const totalByRarity = await prisma.character.groupBy({
    by: ["rarity"],
    _count: { id: true },
  });

  for (const t of totalByRarity) {
    const stat = rarityStats.find((s) => s.rarity === t.rarity);
    if (stat) stat.total = t._count.id;
  }

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <PageHeader
          tag="Collection"
          title="Assets Under Mismanagement"
          subtitle="Each character represents a questionable investment decision."
        />

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatBox
            label="Collected"
            value={`${ownedCount}/${totalCharacters}`}
            subtext={`${completionPercent}% complete`}
            accent="text-crunch"
          />
          <StatBox
            label="Total Power"
            value={totalPower.toLocaleString()}
            subtext="Combined strength"
            accent="text-purple-400"
          />
          <StatBox
            label="Rarest Pull"
            value={
              userCharacters.length > 0
                ? "★".repeat(Math.max(...userCharacters.map((uc) => uc.character.rarity)))
                : "—"
            }
            subtext="Best character"
            accent="text-amber-400"
          />
          <StatBox
            label="Fed Power"
            value={userCharacters.reduce((sum, uc) => sum + uc.fedPower, 0).toLocaleString()}
            subtext="From spending"
            accent="text-sky-400"
          />
        </div>

        {/* Rarity Progress */}
        <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-5 mb-10">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              Progress by Rarity
            </h3>
            <div className="h-px flex-1 bg-[#1a1a2e]" />
          </div>
          <div className="flex flex-wrap gap-5">
            {rarityStats.map(({ rarity, owned, total }) => (
              <div key={rarity} className="flex items-center gap-2">
                <span className={`text-sm ${getRarityColor(rarity)}`}>
                  {"★".repeat(rarity)}
                </span>
                <span className="text-[12px] text-slate-400 font-mono">
                  {owned}/{total}
                </span>
                {owned === total && total > 0 && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider border border-emerald-500/20">
                    Complete
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

function EmptyCollection() {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-dashed border-[#2a2a3e] rounded-2xl px-10 py-20 text-center">
      <div className="text-6xl mb-5">🃏</div>
      <h3 className="text-xl font-bold text-slate-200 font-display mb-2">
        No Characters Yet
      </h3>
      <p className="text-sm text-slate-600 font-body mb-6 max-w-md mx-auto">
        Your portfolio is looking empty. Time to make some questionable
        financial decisions at the gacha.
      </p>
      <Link
        href="/gacha"
        className="inline-block px-6 py-3 bg-crunch hover:bg-crunch-dark text-amber-950 font-bold rounded-xl transition-all duration-200 font-display uppercase tracking-wider text-sm shadow-lg shadow-amber-500/20"
      >
        Pull Characters
      </Link>
    </div>
  );
}

function getRarityColor(rarity: number): string {
  switch (rarity) {
    case 5: return "text-amber-400";
    case 4: return "text-purple-400";
    case 3: return "text-blue-400";
    case 2: return "text-green-400";
    default: return "text-slate-400";
  }
}
