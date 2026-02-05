"use client";

// app/auth/error/page.tsx
// Authentication error page

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
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Error icon */}
        <div className="text-6xl mb-6">💀</div>

        {/* Error content */}
        <h1 className="text-2xl font-extrabold text-slate-100 font-display tracking-tight mb-3">
          {errorInfo.title}
        </h1>
        <p className="text-sm text-slate-500 font-body mb-8">
          {errorInfo.description}
        </p>

        {/* Error code badge */}
        <div className="inline-block px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg mb-8">
          <span className="font-mono text-[11px] text-red-400 tracking-wide uppercase">
            Error: {errorType}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-crunch hover:bg-crunch-hover text-crunch-dark font-semibold rounded-xl transition-all duration-200"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-ww-surface hover:bg-ww-surface-hover border border-ww-border text-slate-300 font-semibold rounded-xl transition-all duration-200"
          >
            Go Home
          </Link>
        </div>

        {/* Satirical footer */}
        <p className="mt-12 text-[10px] text-slate-800 font-mono">
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
          <div className="text-slate-500">Loading...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
