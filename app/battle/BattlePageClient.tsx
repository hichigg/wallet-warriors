"use client";

import { useState } from "react";
import { BattleArena } from "@/components/BattleArena";
import { BuzzwordSelector } from "@/components/BuzzwordSelector";

interface BuzzwordItem {
  id: string;
  name: string;
  cost: number;
  effect: { type: string; value: number };
  description: string;
  owned: number;
}

interface BattlePageClientProps {
  userName: string;
  userPower: number;
  userRanking: number;
  hasCharacters: boolean;
  buzzwords: BuzzwordItem[];
  crunchCoin: number;
}

export function BattlePageClient({
  userName,
  userPower,
  userRanking,
  hasCharacters,
  buzzwords,
  crunchCoin,
}: BattlePageClientProps) {
  const [selectedBuzzwordId, setSelectedBuzzwordId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Buzzword Selector */}
      {buzzwords.length > 0 && (
        <BuzzwordSelector
          buzzwords={buzzwords}
          crunchCoin={crunchCoin}
          selectedId={selectedBuzzwordId}
          onSelect={setSelectedBuzzwordId}
        />
      )}

      {/* Arena */}
      <BattleArena
        userName={userName}
        userPower={userPower}
        userRanking={userRanking}
        hasCharacters={hasCharacters}
        selectedBuzzwordId={selectedBuzzwordId}
      />
    </div>
  );
}
