"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RewardState {
  show: boolean;
  reward: number;
  streak: number;
  isStreakReset: boolean;
}

export function DailyLoginReward() {
  const { data: session, status } = useSession();
  const [rewardState, setRewardState] = useState<RewardState | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const claimReward = async () => {
      try {
        const res = await fetch("/api/user/daily-login", { method: "POST" });
        const data = await res.json();

        if (data.claimed) {
          setRewardState({
            show: true,
            reward: data.reward,
            streak: data.streak,
            isStreakReset: data.isStreakReset,
          });
        }
      } catch (error) {
        console.error("Failed to claim daily reward:", error);
      }
    };

    // Small delay to let the page load first
    const timer = setTimeout(claimReward, 1000);
    return () => clearTimeout(timer);
  }, [status, session]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setRewardState(null);
      setIsClosing(false);
    }, 300);
  };

  if (!rewardState?.show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-amber-500/10 transition-transform duration-300 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative text-center">
          {/* Icon */}
          <div className="text-6xl mb-4 animate-bounce">💧</div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-slate-100 font-display mb-2">
            Daily Login Reward!
          </h2>

          {/* Streak info */}
          {rewardState.isStreakReset ? (
            <p className="text-sm text-red-400 font-mono mb-4">
              Streak reset! Start fresh.
            </p>
          ) : (
            <p className="text-sm text-slate-400 font-mono mb-4">
              Day {rewardState.streak} streak
              {rewardState.streak >= 7 && " - Max bonus!"}
            </p>
          )}

          {/* Reward amount */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-4xl font-bold text-green-400 font-display">
              +{rewardState.reward}
            </p>
            <p className="text-sm text-green-400/80 font-mono mt-1">
              Trickle Tokens
            </p>
          </div>

          {/* Streak preview */}
          <div className="flex justify-center gap-1 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono ${
                  day <= rewardState.streak
                    ? "bg-amber-500 text-amber-950 font-bold"
                    : "bg-slate-800 text-slate-600"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Satirical text */}
          <p className="text-[10px] text-slate-600 font-mono mb-4">
            Keep logging in daily. We need the engagement metrics.
          </p>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold rounded-xl transition-all duration-200"
          >
            Collect
          </button>
        </div>
      </div>
    </div>
  );
}
