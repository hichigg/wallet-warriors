"use client";

import { useState } from "react";

interface BuzzwordItem {
  id: string;
  name: string;
  cost: number;
  effect: { type: string; value: number };
  description: string;
  owned: number;
}

interface BuzzwordSelectorProps {
  buzzwords: BuzzwordItem[];
  crunchCoin: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  disabled?: boolean;
}

const EFFECT_LABELS: Record<string, string> = {
  power_boost_pct: "PWR",
  opponent_debuff_pct: "DEBUFF",
};

export function BuzzwordSelector({
  buzzwords,
  crunchCoin,
  selectedId,
  onSelect,
  disabled,
}: BuzzwordSelectorProps) {
  const [buying, setBuying] = useState<string | null>(null);
  const [localBuzzwords, setLocalBuzzwords] = useState(buzzwords);
  const [localCC, setLocalCC] = useState(crunchCoin);

  async function handleBuy(buzzwordId: string) {
    setBuying(buzzwordId);
    try {
      const res = await fetch("/api/buzzwords/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buzzwordId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLocalBuzzwords((prev) =>
          prev.map((bw) =>
            bw.id === buzzwordId ? { ...bw, owned: data.newQuantity } : bw,
          ),
        );
        setLocalCC(data.newCrunchCoin);
      }
    } catch {
      // silent fail
    } finally {
      setBuying(null);
    }
  }

  const ownedBuzzwords = localBuzzwords.filter((bw) => bw.owned > 0);
  const shopBuzzwords = localBuzzwords;

  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#1a1a2e] flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
          Buzzword Powerups
        </span>
        <span className="text-[10px] font-mono text-crunch">
          {localCC.toLocaleString()} CC
        </span>
      </div>

      <div className="p-4">
        {/* Selected buzzword */}
        {selectedId && (
          <div className="mb-3 px-3 py-2 bg-crunch/[0.06] border border-crunch-border rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-crunch/70 uppercase">Equipped:</span>
              <span className="text-[12px] font-display font-bold text-crunch">
                {localBuzzwords.find((bw) => bw.id === selectedId)?.name}
              </span>
            </div>
            <button
              onClick={() => onSelect(null)}
              disabled={disabled}
              className="text-[10px] font-mono text-slate-600 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        )}

        {/* Owned buzzwords (quick equip) */}
        {ownedBuzzwords.length > 0 && (
          <div className="mb-3">
            <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider mb-2">
              Your Inventory
            </p>
            <div className="flex flex-wrap gap-2">
              {ownedBuzzwords.map((bw) => (
                <button
                  key={bw.id}
                  onClick={() => onSelect(selectedId === bw.id ? null : bw.id)}
                  disabled={disabled}
                  className={`
                    px-3 py-1.5 rounded-lg border text-[11px] font-mono transition-all
                    ${selectedId === bw.id
                      ? "bg-crunch/10 border-crunch-border text-crunch"
                      : "bg-[#0a0a14] border-[#1a1a2e] text-slate-400 hover:border-[#2a2a3e]"
                    }
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {bw.name}
                  <span className="ml-1 text-[9px] text-slate-600">x{bw.owned}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shop */}
        <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider mb-2">
          Buy Buzzwords
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
          {shopBuzzwords.map((bw) => {
            const canAfford = localCC >= bw.cost;
            const isBuying = buying === bw.id;
            return (
              <div
                key={bw.id}
                className="bg-[#0a0a14] border border-[#141428] rounded-lg p-2.5 sm:p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-display font-bold text-slate-300">
                    {bw.name}
                  </span>
                  {bw.owned > 0 && (
                    <span className="text-[9px] font-mono text-crunch/60">x{bw.owned}</span>
                  )}
                </div>
                <p className="text-[9px] font-mono text-slate-600 mb-2 line-clamp-2">
                  {bw.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    +{bw.effect.value}% {EFFECT_LABELS[bw.effect.type] ?? bw.effect.type}
                  </span>
                  <button
                    onClick={() => handleBuy(bw.id)}
                    disabled={!canAfford || isBuying || disabled}
                    className={`
                      text-[10px] font-mono px-2 py-1 rounded transition-all
                      ${canAfford && !disabled
                        ? "bg-crunch/10 text-crunch border border-crunch-border hover:bg-crunch/20"
                        : "bg-[#111120] text-slate-700 border border-[#1a1a2e] cursor-not-allowed"
                      }
                    `}
                  >
                    {isBuying ? "..." : `${bw.cost} CC`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
