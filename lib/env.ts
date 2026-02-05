// lib/env.ts
// Runtime validation for required environment variables.
// Import this at the top of critical modules (auth, stripe, webhook).

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Auth
export const NEXTAUTH_SECRET = () => requireEnv("NEXTAUTH_SECRET");
export const GOOGLE_CLIENT_ID = () => requireEnv("GOOGLE_CLIENT_ID");
export const GOOGLE_CLIENT_SECRET = () => requireEnv("GOOGLE_CLIENT_SECRET");

// Database (validated by Prisma at connection time, no need to re-check)

// Stripe (lazy — only validated when payment features are used)
export const STRIPE_SECRET_KEY = () => requireEnv("STRIPE_SECRET_KEY");
export const STRIPE_WEBHOOK_SECRET = () => requireEnv("STRIPE_WEBHOOK_SECRET");
