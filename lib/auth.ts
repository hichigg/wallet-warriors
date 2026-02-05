// lib/auth.ts
// NextAuth.js configuration with Google OAuth and Prisma adapter

import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";
import { NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "./env";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  secret: NEXTAUTH_SECRET(),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID(),
      clientSecret: GOOGLE_CLIENT_SECRET(),
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add user id and game data to session
      if (session.user) {
        session.user.id = user.id;

        // Fetch game-specific data
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            crunchCoin: true,
            trickleTokens: true,
            totalSpent: true,
            rankingPoints: true,
            username: true,
          },
        });

        if (dbUser) {
          session.user.crunchCoin = dbUser.crunchCoin;
          session.user.trickleTokens = dbUser.trickleTokens;
          session.user.totalSpent = Number(dbUser.totalSpent);
          session.user.rankingPoints = dbUser.rankingPoints;
          session.user.username = dbUser.username;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
};
