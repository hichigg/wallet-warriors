// types/next-auth.d.ts
// Extend NextAuth types with Wallet Warriors user fields

import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      crunchCoin?: number;
      trickleTokens?: number;
      totalSpent?: number;
      rankingPoints?: number;
      username?: string | null;
    };
  }
}
