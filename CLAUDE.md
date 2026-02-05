# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Wallet Warriors is a satirical gacha game built with Next.js where the monetization mechanics ARE the game. It's a transparent commentary on pay-to-win mechanics - the leaderboard openly shows total $ spent.

## Commands

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Run ESLint checks
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Supabase with Prisma 7 ORM
- **Styling**: Tailwind CSS with custom brand theme
- **Auth**: NextAuth.js v4 with Google OAuth, Prisma adapter

## Architecture

### Database Access
All database queries go through the Prisma client singleton at `lib/prisma.ts`. Uses PostgreSQL adapter with connection pooling via Supabase.

### Database Schema (prisma/schema.prisma)
Core entities:
- **User** - Player accounts with crunchCoin, trickleTokens, totalSpent, rankingPoints
- **Character** - Gacha characters with rarity (1-5 stars) and basePower
- **UserCharacter** - Ownership with fedPower progression (additional power from spending)
- **Battle** - PvP with power snapshots, RNG variance (±5%), ranking point changes
- **Transaction** - Stripe payment tracking with package types (seed_round, series_a, etc.)
- **Buzzword** - Battle power-ups with JSON effects and crunchCoin costs

### Environment Variables
- `DATABASE_URL` - Pooled connection (port 6543) for app queries
- `DIRECT_URL` - Direct connection (port 5432) for Prisma migrations
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL` - Auth configuration
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth credentials

### Authentication
- Config: `lib/auth.ts` - NextAuth options with Prisma adapter
- API route: `app/api/auth/[...nextauth]/route.ts`
- Session provider wraps app in `app/layout.tsx`
- Custom pages: `/auth/signin`, `/auth/error`
- Server helpers: `lib/auth-helpers.ts` - `getSession()`, `getCurrentUser()`
- Type extensions: `types/next-auth.d.ts` - adds game fields to session.user

### Path Conventions
- `app/` - Next.js App Router pages and layouts
- `components/` - React components (currently empty)
- `lib/` - Shared utilities (prisma client)
- `prisma/` - Schema and migrations

### Styling
Custom Tailwind theme with brand colors: crunch-gold, crunch-purple, crunch-green, crunch-dark. Custom animations defined in `tailwind.config.ts` (pulse-gold, shine).

## Current State

Landing page and layout components complete. NextAuth with Google OAuth configured. Pending: gacha system, battle mechanics, Stripe integration, leaderboard, user dashboard.
