"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PullAnimation } from "./PullAnimation";
import type { PullResult, PullCurrency } from "@/lib/gacha";

interface GachaPullProps {
  userBalance: {
    crunchCoin: number;
    trickleTokens: number;
  };
  pityCounter: number;
  freePullAvailable: boolean;
  costs: {
    crunchCoin: number;
    trickleTokens: number;
  };
}

type PullState = "idle" | "pulling" | "animating";

export function GachaPull({ userBalance, pityCounter, freePullAvailable, costs }: GachaPullProps) {
  const router = useRouter();
  const [state, setState] = useState<PullState>("idle");
  const [currency, setCurrency] = useState<PullCurrency>("crunchCoin");
  const [pullResults, setPullResults] = useState<PullResult[]>([]);
  const [isFreePull, setIsFreePull] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAffordSingle = currency === "crunchCoin"
    ? userBalance.crunchCoin >= costs.crunchCoin
    : userBalance.trickleTokens >= costs.trickleTokens;

  const canAfford10 = currency === "crunchCoin"
    ? userBalance.crunchCoin >= costs.crunchCoin * 10
    : userBalance.trickleTokens >= costs.trickleTokens * 10;

  const executePull = useCallback(async (count: 1 | 10) => {
    setError(null);
    setState("pulling");

    try {
      const res = await fetch("/api/gacha/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency, count }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pull failed");
        setState("idle");
        return;
      }

      setPullResults(data.pulls);
      setIsFreePull(data.isFreePull || false);
      setState("animating");
    } catch {
      setError("Network error. Please try again.");
      setState("idle");
    }
  }, [currency]);

  const handleAnimationComplete = useCallback(() => {
    setState("idle");
    setPullResults([]);
    router.refresh(); // Refresh to update balances
  }, [router]);

  // Show animation overlay
  if (state === "animating" && pullResults.length > 0) {
    return (
      <PullAnimation
        results={pullResults}
        onComplete={handleAnimationComplete}
        isFreePull={isFreePull}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Pity Counter */}
      <div className="bg-ww-surface border border-ww-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
            Pity Counter
          </span>
          <span className="text-xs text-amber-400/70 font-mono">
            Guaranteed 5★ at 100
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-ww-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
              style={{ width: `${pityCounter}%` }}
            />
          </div>
          <span className="text-lg font-bold font-mono text-amber-400">
            {pityCounter}/100
          </span>
        </div>
        {pityCounter >= 75 && (
          <p className="mt-2 text-xs text-amber-400/80 font-mono">
            Soft pity active! Increased 5★ rates.
          </p>
        )}
      </div>

      {/* Free Pull Banner */}
      {freePullAvailable && (
        <div className="relative overflow-hidden bg-gradient-to-r from-trickle/20 via-trickle/10 to-trickle/20 border border-trickle/40 rounded-xl p-6 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine"
               style={{ backgroundSize: "200% 100%" }} />
          <div className="relative z-10">
            <span className="text-4xl mb-3 block">🎁</span>
            <h3 className="text-xl font-bold text-trickle font-display mb-1">
              Welcome Bonus!
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Your first pull is FREE. Let&apos;s see what you get!
            </p>
            <button
              onClick={() => executePull(1)}
              disabled={state === "pulling"}
              className="px-8 py-3 bg-trickle hover:bg-trickle-dark text-black font-bold rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {state === "pulling" ? "Pulling..." : "Claim Free Pull"}
            </button>
          </div>
        </div>
      )}

      {/* Regular Pull UI */}
      {!freePullAvailable && (
        <>
          {/* Currency Selector */}
          <div className="bg-ww-surface border border-ww-border rounded-xl p-4">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider block mb-3">
              Payment Method
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCurrency("crunchCoin")}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${currency === "crunchCoin"
                    ? "border-crunch bg-crunch-bg"
                    : "border-ww-border hover:border-ww-border-hover bg-ww-elevated"
                  }
                `}
              >
                <div className="text-2xl mb-1">🪙</div>
                <div className="font-bold text-slate-200">CrunchCoin</div>
                <div className={`text-lg font-mono ${currency === "crunchCoin" ? "text-crunch" : "text-slate-400"}`}>
                  {userBalance.crunchCoin.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {costs.crunchCoin}/pull
                </div>
              </button>

              <button
                onClick={() => setCurrency("trickleTokens")}
                className={`
                  p-4 rounded-xl border-2 transition-all duration-200
                  ${currency === "trickleTokens"
                    ? "border-trickle bg-trickle-bg"
                    : "border-ww-border hover:border-ww-border-hover bg-ww-elevated"
                  }
                `}
              >
                <div className="text-2xl mb-1">💧</div>
                <div className="font-bold text-slate-200">Trickle Tokens</div>
                <div className={`text-lg font-mono ${currency === "trickleTokens" ? "text-trickle" : "text-slate-400"}`}>
                  {userBalance.trickleTokens.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {costs.trickleTokens}/pull (worse value)
                </div>
              </button>
            </div>
          </div>

          {/* Pull Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Single Pull */}
            <button
              onClick={() => executePull(1)}
              disabled={state === "pulling" || !canAffordSingle}
              className={`
                relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-200
                ${canAffordSingle
                  ? "border-crunch/50 hover:border-crunch bg-crunch-bg hover:bg-crunch-bg"
                  : "border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed"
                }
                disabled:opacity-50
              `}
            >
              {canAffordSingle && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-crunch/10 to-transparent animate-shine"
                     style={{ backgroundSize: "200% 100%" }} />
              )}
              <div className="relative z-10">
                <div className="text-4xl mb-2">🎰</div>
                <div className="font-bold text-lg text-slate-100 font-display">
                  Single Pull
                </div>
                <div className={`text-sm font-mono mt-1 ${currency === "crunchCoin" ? "text-crunch" : "text-trickle"}`}>
                  {currency === "crunchCoin" ? costs.crunchCoin : costs.trickleTokens}
                  <span className="text-slate-500 ml-1">
                    {currency === "crunchCoin" ? "CC" : "TT"}
                  </span>
                </div>
              </div>
            </button>

            {/* 10-Pull */}
            <button
              onClick={() => executePull(10)}
              disabled={state === "pulling" || !canAfford10}
              className={`
                relative overflow-hidden p-6 rounded-xl border-2 transition-all duration-200
                ${canAfford10
                  ? "border-amber-500/60 hover:border-amber-400 bg-gradient-to-br from-amber-500/10 to-amber-600/10"
                  : "border-slate-700 bg-slate-800/50 opacity-50 cursor-not-allowed"
                }
                disabled:opacity-50
              `}
            >
              {canAfford10 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shine"
                     style={{ backgroundSize: "200% 100%" }} />
              )}
              <div className="relative z-10">
                <div className="text-4xl mb-2">🎰🎰</div>
                <div className="font-bold text-lg text-slate-100 font-display">
                  10-Pull
                </div>
                <div className={`text-sm font-mono mt-1 ${currency === "crunchCoin" ? "text-crunch" : "text-trickle"}`}>
                  {currency === "crunchCoin" ? costs.crunchCoin * 10 : costs.trickleTokens * 10}
                  <span className="text-slate-500 ml-1">
                    {currency === "crunchCoin" ? "CC" : "TT"}
                  </span>
                </div>
                <div className="text-[10px] text-amber-400 mt-1">
                  BETTER VALUE
                </div>
              </div>
            </button>
          </div>

          {/* Loading State */}
          {state === "pulling" && (
            <div className="text-center py-8">
              <div className="text-4xl animate-bounce mb-4">💰</div>
              <p className="text-slate-400 font-mono animate-pulse">
                Processing transaction...
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 font-mono text-sm">{error}</p>
            </div>
          )}

          {/* Not enough currency message */}
          {!canAffordSingle && (
            <div className="bg-ww-surface border border-slate-700 rounded-xl p-6 text-center">
              <p className="text-slate-400 mb-4">
                Not enough {currency === "crunchCoin" ? "CrunchCoin" : "Trickle Tokens"} for a pull.
              </p>
              <a
                href="/shop"
                className="inline-block px-6 py-3 bg-gradient-to-r from-crunch to-crunch-dark text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                Visit the Shop
              </a>
            </div>
          )}
        </>
      )}

      {/* Rates disclosure */}
      <div className="text-center">
        <a href="/api/gacha/rates" target="_blank" className="text-xs text-slate-600 hover:text-slate-500 font-mono underline">
          View drop rates (legally required)
        </a>
      </div>
    </div>
  );
}
