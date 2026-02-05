"use client";

import { useState } from "react";
import type { Character } from "@prisma/client";

interface CharacterCardProps {
  character: Character;
  fedPower?: number;
  acquiredAt?: Date;
  showBio?: boolean;
}

const RARITY_CONFIG = {
  5: {
    label: "LEGENDARY",
    stars: "★★★★★",
    gradient: "from-amber-500/20 via-yellow-500/10 to-amber-600/20",
    border: "border-amber-500/50",
    glow: "shadow-amber-500/20",
    text: "text-amber-400",
    bg: "bg-amber-500",
  },
  4: {
    label: "SUPER RARE",
    stars: "★★★★☆",
    gradient: "from-purple-500/20 via-fuchsia-500/10 to-purple-600/20",
    border: "border-purple-500/50",
    glow: "shadow-purple-500/20",
    text: "text-purple-400",
    bg: "bg-purple-500",
  },
  3: {
    label: "RARE",
    stars: "★★★☆☆",
    gradient: "from-blue-500/20 via-cyan-500/10 to-blue-600/20",
    border: "border-blue-500/50",
    glow: "shadow-blue-500/20",
    text: "text-blue-400",
    bg: "bg-blue-500",
  },
  2: {
    label: "UNCOMMON",
    stars: "★★☆☆☆",
    gradient: "from-green-500/20 via-emerald-500/10 to-green-600/20",
    border: "border-green-500/50",
    glow: "shadow-green-500/20",
    text: "text-green-400",
    bg: "bg-green-500",
  },
  1: {
    label: "COMMON",
    stars: "★☆☆☆☆",
    gradient: "from-slate-500/20 via-slate-400/10 to-slate-600/20",
    border: "border-slate-500/50",
    glow: "shadow-slate-500/20",
    text: "text-slate-400",
    bg: "bg-slate-500",
  },
} as const;

export function CharacterCard({
  character,
  fedPower = 0,
  acquiredAt,
  showBio = false,
}: CharacterCardProps) {
  const [expanded, setExpanded] = useState(showBio);
  const config = RARITY_CONFIG[character.rarity as keyof typeof RARITY_CONFIG];
  const totalPower = character.basePower + fedPower;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border ${config.border}
        bg-gradient-to-br ${config.gradient}
        shadow-lg ${config.glow}
        transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
      `}
    >
      {/* Rarity Banner */}
      <div className={`${config.bg} px-3 py-1`}>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider text-white/90">
            {config.label}
          </span>
          <span className="text-xs text-white/80">{config.stars}</span>
        </div>
      </div>

      {/* Character Content */}
      <div className="p-4">
        {/* Avatar placeholder */}
        <div className="w-full aspect-square rounded-lg bg-black/30 border border-white/10 mb-3 flex items-center justify-center">
          <span className="text-5xl opacity-60">
            {getCharacterEmoji(character.name)}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-lg font-bold text-slate-100 font-display leading-tight mb-1">
          {character.name}
        </h3>

        {/* Power Stats */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">PWR</span>
            <span className={`text-lg font-bold font-mono ${config.text}`}>
              {totalPower.toLocaleString()}
            </span>
          </div>
          {fedPower > 0 && (
            <span className="text-[10px] text-amber-400/80 font-mono bg-amber-400/10 px-1.5 py-0.5 rounded">
              +{fedPower} fed
            </span>
          )}
        </div>

        {/* Bio Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left text-[11px] text-slate-500 hover:text-slate-400 font-mono transition-colors"
        >
          {expanded ? "▼ Hide bio" : "▶ Show bio"}
        </button>

        {/* Bio */}
        {expanded && (
          <p className="mt-2 text-xs text-slate-400 font-body leading-relaxed border-t border-white/10 pt-2">
            {character.bio}
          </p>
        )}

        {/* Acquired Date */}
        {acquiredAt && (
          <p className="mt-3 text-[10px] text-slate-600 font-mono">
            Acquired {formatDate(acquiredAt)}
          </p>
        )}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getCharacterEmoji(name: string): string {
  const emojiMap: Record<string, string> = {
    "Unpaid Intern": "👨‍💻",
    "Hustle Culture Guru": "🧘",
    "Crypto Bro": "🦍",
    "LinkedIn Thought Leader": "💼",
    "Gig Economy Warrior": "🚗",
    "Angel Investor": "😇",
    "Growth Hacker": "📈",
    "Productivity Podcaster": "🎙️",
    "NFT Artist": "🎨",
    "Startup Founder": "🚀",
    "Series A Survivor": "💰",
    "Tech Conference Speaker": "🎤",
    "Wellness CEO": "🧴",
    "VC Partner": "🦈",
    "DeFi Degen": "🎰",
    "Unicorn Founder": "🦄",
    "Corporate Raider": "🏴‍☠️",
    "Hedge Fund Manager": "🎩",
    "Tech Evangelist": "📣",
    "Rocket Billionaire": "🚀",
    "Social Media Overlord": "👁️",
    "E-Commerce Emperor": "📦",
    "Software Sovereign": "🪟",
    "The Index Fund": "📊",
  };

  return emojiMap[name] || "💸";
}
