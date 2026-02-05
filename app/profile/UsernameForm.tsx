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
        className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors font-mono"
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
          className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5"
        >
          Username
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
            @
          </span>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="your_username"
            maxLength={20}
            className="w-full pl-8 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-200 font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
            autoFocus
          />
        </div>
        <p className="mt-1 text-[10px] text-slate-600 font-mono">
          Letters, numbers, underscores only. Max 20 chars.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-400 font-mono">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setUsername(currentUsername || "");
            setError(null);
          }}
          className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-400 transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !username.trim() || username === currentUsername}
          className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-amber-950 font-semibold rounded-xl text-sm transition-colors"
        >
          {isLoading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
