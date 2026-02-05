"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UsernameFormProps {
  currentUsername: string | null;
}

export function UsernameForm({ currentUsername }: UsernameFormProps) {
  const [username, setUsername] = useState(currentUsername || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update username");
        return;
      }

      setIsEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="w-full px-4 py-2.5 bg-[#111120] hover:bg-[#16162a] border border-[#1a1a2e] hover:border-[#2a2a3e] rounded-xl text-[12px] text-slate-500 hover:text-slate-300 transition-all font-mono uppercase tracking-wider cursor-pointer"
      >
        {currentUsername ? "Change Username" : "Set Username"}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="username"
          className="block text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-1.5"
        >
          Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-sm">
            @
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="your_username"
            maxLength={20}
            className="w-full pl-8 pr-4 py-2.5 bg-[#0a0a14] border border-[#1a1a2e] rounded-xl text-sm text-slate-200 font-mono placeholder:text-slate-700 focus:outline-none focus:border-crunch/30 focus:ring-1 focus:ring-crunch/10"
            autoFocus
          />
        </div>
        <p className="mt-1 text-[9px] text-slate-700 font-mono">
          Letters, numbers, underscores only. Max 20 chars.
        </p>
      </div>

      {error && (
        <p className="text-[11px] text-red-400 font-mono animate-shake">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setUsername(currentUsername || "");
            setError(null);
          }}
          className="flex-1 px-4 py-2 bg-[#111120] hover:bg-[#16162a] border border-[#1a1a2e] rounded-xl text-[12px] text-slate-500 transition-colors font-mono cursor-pointer"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !username.trim() || username === currentUsername}
          className="flex-1 px-4 py-2 bg-crunch hover:bg-crunch-dark disabled:bg-[#1a1a2e] disabled:text-slate-600 text-amber-950 font-bold rounded-xl text-[12px] transition-colors font-display uppercase tracking-wider cursor-pointer"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
