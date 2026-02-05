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

  const freePullAvailable = await checkFreePullEligibility(session.user.id);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.04)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-6 py-16">
        <PageHeader
          tag="Gacha"
          title="Allocate Capital"
          subtitle="Diversify your portfolio of fictional billionaires. Results may vary. Regret will not."
        />

        {/* Rates Preview */}
        <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              Current Rates
            </h3>
            <div className="h-px flex-1 bg-[#1a1a2e]" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
            {Object.entries(GACHA_RATES).map(([rarity, rate]) => (
              <div key={rarity} className="p-2 rounded-lg bg-white/[0.02]">
                <div className={`text-sm font-bold mb-0.5 ${getRarityColor(Number(rarity))}`}>
                  {"★".repeat(Number(rarity))}
                </div>
                <div className="text-slate-400 text-[12px] font-mono font-bold">{rate}%</div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-slate-700 mt-4 font-mono text-center uppercase tracking-wider">
            Soft pity (+5%/pull) at {SOFT_PITY_START} &middot; Hard pity at {PITY_THRESHOLD}
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
