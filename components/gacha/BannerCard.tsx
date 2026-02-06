"use client";

import { useEffect, useState } from "react";

interface BannerCardProps {
  name: string;
  featuredChar: {
    name: string;
    rarity: number;
    basePower: number;
  };
  rateUpPercent: number;
  endDate: Date;
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

function getRarityBorder(rarity: number): string {
  switch (rarity) {
    case 5: return "border-amber-500/40";
    case 4: return "border-purple-500/40";
    case 3: return "border-blue-500/40";
    default: return "border-slate-500/40";
  }
}

function getRarityGlow(rarity: number): string {
  switch (rarity) {
    case 5: return "from-amber-500/15 to-amber-600/5";
    case 4: return "from-purple-500/15 to-purple-600/5";
    case 3: return "from-blue-500/15 to-blue-600/5";
    default: return "from-slate-500/15 to-slate-600/5";
  }
}

function getCountdown(endDate: Date): string {
  const now = new Date();
  const diff = new Date(endDate).getTime() - now.getTime();

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function BannerCard({ name, featuredChar, rateUpPercent, endDate }: BannerCardProps) {
  const [countdown, setCountdown] = useState(getCountdown(endDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(endDate));
    }, 60_000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${getRarityGlow(featuredChar.rarity)} border ${getRarityBorder(featuredChar.rarity)} rounded-2xl p-6`}>
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine"
           style={{ backgroundSize: "200% 100%" }} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.2em]">
              Limited Banner
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider">
              Ends in {countdown}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="text-5xl flex-shrink-0">
            {featuredChar.rarity === 5 ? "👑" : featuredChar.rarity === 4 ? "💎" : "⭐"}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-100 font-display">
              {name}
            </h3>
            <p className={`text-sm font-bold ${getRarityColor(featuredChar.rarity)}`}>
              {"★".repeat(featuredChar.rarity)} {featuredChar.name}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Rate Up: {rateUpPercent}% chance when pulling {featuredChar.rarity}★
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
