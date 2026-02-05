"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">&#128200;</div>
        <h2 className="text-xl font-bold text-slate-200 font-display mb-2">
          Market Crash Detected
        </h2>
        <p className="text-sm text-slate-500 font-body mb-6">
          Something went wrong. Your portfolio is safe (probably).
        </p>
        <p className="text-[10px] text-slate-700 font-mono mb-6 break-all">
          {error.message}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-crunch/10 border border-crunch-border text-crunch font-display font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-crunch/20 transition-all"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
