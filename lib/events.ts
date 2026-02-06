// lib/events.ts
// Seasonal event system

import { prisma } from "./prisma";

export interface ActiveEvent {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number;
  startDate: Date;
  endDate: Date;
}

/**
 * Get all currently active seasonal events
 */
export async function getActiveEvents(): Promise<ActiveEvent[]> {
  const now = new Date();
  return prisma.seasonalEvent.findMany({
    where: {
      startDate: { lte: now },
      endDate: { gt: now },
    },
  });
}

/**
 * Get the modifier value for a specific event type
 * Returns 0 if no event of that type is active
 */
export function getEventModifier(events: ActiveEvent[], type: string): number {
  const event = events.find((e) => e.type === type);
  return event?.value ?? 0;
}

/**
 * Get the multiplier for a specific event type (for "double_tokens" etc.)
 * Returns 1 if no event of that type is active
 */
export function getEventMultiplier(events: ActiveEvent[], type: string): number {
  const event = events.find((e) => e.type === type);
  return event ? event.value : 1;
}
