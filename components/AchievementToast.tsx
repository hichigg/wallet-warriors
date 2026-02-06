"use client";

import { useEffect, useState } from "react";

interface Achievement {
  key: string;
  name: string;
  description: string;
  rewardCC: number;
  rewardTT: number;
  iconEmoji: string;
}

interface AchievementToastProps {
  achievements: Achievement[];
  onDismiss: () => void;
}

export function AchievementToast({ achievements, onDismiss }: AchievementToastProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (currentIndex >= achievements.length) {
      onDismiss();
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsVisible(true);
      }, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onDismiss]);

  if (currentIndex >= achievements.length) return null;

  const achievement = achievements[currentIndex];

  return (
    <div
      className={`fixed top-6 right-6 z-[200] transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a1a2e] to-[#111120] border border-amber-500/30 rounded-2xl p-5 max-w-sm shadow-2xl shadow-amber-500/10">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-start gap-4">
          <div className="text-4xl flex-shrink-0">{achievement.iconEmoji}</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono text-amber-400/60 uppercase tracking-[0.2em]">
                Achievement Unlocked
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 font-display truncate">
              {achievement.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {achievement.description}
            </p>
            {(achievement.rewardCC > 0 || achievement.rewardTT > 0) && (
              <div className="flex items-center gap-3 mt-2">
                {achievement.rewardCC > 0 && (
                  <span className="text-xs font-mono text-crunch font-bold">
                    +{achievement.rewardCC} CC
                  </span>
                )}
                {achievement.rewardTT > 0 && (
                  <span className="text-xs font-mono text-trickle font-bold">
                    +{achievement.rewardTT} TT
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress dots */}
        {achievements.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {achievements.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i === currentIndex ? "bg-amber-400" : i < currentIndex ? "bg-amber-400/30" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
