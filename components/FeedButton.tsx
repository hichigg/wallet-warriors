"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FeedButtonProps {
  userCharacterId: string;
  currentFedPower: number;
  maxFedPower: number;
  nextCost: number;
  powerPerFeed: number;
  feedLevel: number;
  feedLevelName: string;
  userCrunchCoin: number;
  rarity: number;
}

const RARITY_BAR_COLORS: Record<number, string> = {
  5: "bg-amber-500",
  4: "bg-purple-500",
  3: "bg-blue-500",
  2: "bg-green-500",
  1: "bg-slate-500",
};

export function FeedButton({
  userCharacterId,
  currentFedPower,
  maxFedPower,
  nextCost,
  powerPerFeed,
  feedLevel,
  feedLevelName,
  userCrunchCoin,
  rarity,
}: FeedButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "feeding" | "success">("idle");
  const [resultPower, setResultPower] = useState(0);
  const [localFedPower, setLocalFedPower] = useState(currentFedPower);
  const [localCoin, setLocalCoin] = useState(userCrunchCoin);
  const [localCost, setLocalCost] = useState(nextCost);
  const [localFeedLevel, setLocalFeedLevel] = useState(feedLevel);
  const [localFeedLevelName, setLocalFeedLevelName] = useState(feedLevelName);
  const [error, setError] = useState<string | null>(null);

  const isMaxed = localFedPower >= maxFedPower;
  const canAfford = localCoin >= localCost;
  const progressPercent = maxFedPower > 0 ? Math.min((localFedPower / maxFedPower) * 100, 100) : 0;
  const barColor = RARITY_BAR_COLORS[rarity] ?? "bg-slate-500";

  async function handleFeed() {
    if (isMaxed || !canAfford || state !== "idle") return;

    setState("feeding");
    setError(null);

    try {
      const res = await fetch("/api/character/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userCharacterId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Feed failed.");
        setState("idle");
        return;
      }

      setResultPower(data.powerGained);
      setLocalFedPower(data.newFedPower);
      setLocalCoin(data.newCrunchCoin);
      setLocalFeedLevel(data.feedLevel);

      // Recalculate next cost from server data
      if (!data.maxedOut) {
        // cost = baseCost * (feedLevel + 1) — replicate formula client-side
        const baseCosts: Record<number, number> = { 1: 25, 2: 50, 3: 100, 4: 200, 5: 500 };
        setLocalCost((baseCosts[rarity] ?? 25) * (data.feedLevel + 1));
      }

      // Update feed level name based on new state
      if (data.maxedOut) {
        setLocalFeedLevelName("Fully Fed");
      }

      setState("success");
      setTimeout(() => {
        setState("idle");
        router.refresh();
      }, 1200);
    } catch {
      setError("Network error. Try again.");
      setState("idle");
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.06]">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
          Fed Power
        </span>
        <span className="text-[9px] font-mono text-slate-500">
          {localFedPower}/{maxFedPower}
        </span>
      </div>
      <div className="w-full h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Feed level name */}
      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-2">
        Lvl {localFeedLevel} — {localFeedLevelName}
      </p>

      {/* Feed button or maxed badge */}
      {isMaxed ? (
        <div className="text-center py-1.5 px-3 rounded-lg bg-crunch-subtle border border-crunch-border">
          <span className="text-[10px] font-mono font-bold text-crunch uppercase tracking-wider">
            Fully Fed
          </span>
        </div>
      ) : (
        <button
          onClick={handleFeed}
          disabled={!canAfford || state !== "idle"}
          className={`
            w-full py-2 px-3 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider
            transition-all duration-200
            ${canAfford && state === "idle"
              ? "bg-crunch/10 border border-crunch-border text-crunch hover:bg-crunch/20 hover:border-crunch/40 active:scale-[0.98]"
              : "bg-[#1a1a2e] border border-[#1a1a2e] text-slate-700 cursor-not-allowed"
            }
            ${state === "feeding" ? "animate-pulse" : ""}
          `}
        >
          {state === "feeding" && "Feeding..."}
          {state === "success" && (
            <span className="text-emerald-400">+{resultPower} Power!</span>
          )}
          {state === "idle" && (
            canAfford
              ? `Feed (${localCost} CC) → +${powerPerFeed} PWR`
              : `Need ${localCost} CC`
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-[9px] font-mono text-red-400/80">{error}</p>
      )}
    </div>
  );
}
