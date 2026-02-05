"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Configuration Error",
    description: "There's a problem with the server configuration. Our unpaid interns are on it.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You don't have permission to sign in. Your wallet must not be fat enough.",
  },
  Verification: {
    title: "Verification Failed",
    description: "The verification link has expired or was already used. Like your patience, probably.",
  },
  OAuthSignin: {
    title: "OAuth Sign-in Error",
    description: "Error starting the OAuth sign-in flow. Google might be judging your life choices.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "Error during the OAuth callback. The money gods are displeased.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Failed",
    description: "Could not create your account. Even we have standards (barely).",
  },
  EmailCreateAccount: {
    title: "Email Account Error",
    description: "Could not create account with this email. Try a richer-sounding email.",
  },
  Callback: {
    title: "Callback Error",
    description: "Error in the OAuth callback handler. Tech debt strikes again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This email is already associated with another account. Pick a side.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page. No freeloaders allowed.",
  },
  Default: {
    title: "Authentication Error",
    description: "Something went wrong during authentication. Our servers blame you.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "Default";
  const errorInfo = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.Default;

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.03)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-md text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">💀</div>

        {/* Tag */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-red-500/20" />
          <span className="font-mono text-[9px] text-red-400/50 tracking-[0.25em] uppercase">
            Error
          </span>
          <div className="h-px w-8 bg-red-500/20" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-extrabold text-slate-50 font-display tracking-tight mb-3">
          {errorInfo.title}
        </h1>
        <p className="text-sm text-slate-500 font-body mb-8">
          {errorInfo.description}
        </p>

        {/* Error code */}
        <div className="inline-block px-3 py-1.5 bg-red-500/[0.06] border border-red-500/15 rounded-lg mb-8">
          <span className="font-mono text-[10px] text-red-400/70 tracking-[0.15em] uppercase">
            Error: {errorType}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-crunch hover:bg-crunch-dark text-amber-950 font-bold rounded-xl transition-all duration-200 font-display text-sm uppercase tracking-wider"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-[#111120] hover:bg-[#16162a] border border-[#1a1a2e] text-slate-300 font-semibold rounded-xl transition-all duration-200 font-display text-sm"
          >
            Go Home
          </Link>
        </div>

        {/* Fake error ID */}
        <p className="mt-12 text-[9px] text-[#1a1a2e] font-mono">
          Error ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
          <br />
          (This ID means nothing. Just like our error handling.)
        </p>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="text-slate-700 font-mono text-sm animate-pulse">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
