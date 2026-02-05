import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { GachaPull } from "@/components/gacha/GachaPull";
import {
  checkFreePullEligibility,
  PULL_COST_CRUNCHCOIN,
  PULL_COST_TRICKLE,
  GACHA_RATES,
  PITY_THRESHOLD,
  SOFT_PITY_START,
} from "@/lib/gacha";

export default async function GachaPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/gacha");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      crunchCoin: true,
      trickleTokens: true,
      pityCounter: true,
    },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/gacha");
  }

  // Check free pull eligibility
  const freePullAvailable = await checkFreePullEligibility(session.user.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <PageHeader
        tag="Gacha"
        title="Allocate Capital"
        subtitle="Diversify your portfolio of fictional billionaires. Results may vary. Regret will not."
      />

      {/* Rates Preview */}
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4 mb-8">
        <h3 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
          Current Rates
        </h3>
        <div className="grid grid-cols-5 gap-2 text-center">
          {Object.entries(GACHA_RATES).map(([rarity, rate]) => (
            <div key={rarity}>
              <div className={`text-sm font-bold ${getRarityColor(Number(rarity))}`}>
                {"★".repeat(Number(rarity))}
              </div>
              <div className="text-slate-400 text-xs font-mono">{rate}%</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 mt-3 font-mono text-center">
          Soft pity (+5%/pull) starts at {SOFT_PITY_START}. Hard pity at {PITY_THRESHOLD}.
        </p>
      </div>

      {/* Pull Interface */}
      <GachaPull
        userBalance={{
          crunchCoin: user.crunchCoin,
          trickleTokens: user.trickleTokens,
        }}
        pityCounter={user.pityCounter}
        freePullAvailable={freePullAvailable}
        costs={{
          crunchCoin: PULL_COST_CRUNCHCOIN,
          trickleTokens: PULL_COST_TRICKLE,
        }}
      />
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
