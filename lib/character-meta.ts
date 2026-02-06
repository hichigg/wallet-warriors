// lib/character-meta.ts
// Single source of truth for character emoji + title mappings.
// Imported by CharacterCard, PullAnimation, and collection/[id]/page.

export interface CharacterMeta {
  emoji: string;
  title: string;
}

export const CHARACTER_META: Record<string, CharacterMeta> = {
  // 5★ LEGENDARY
  "Melon Husk":         { emoji: "🚀", title: "Chief Twit" },
  "Mark Zuckerborg":    { emoji: "👁️", title: "Meta Lord" },
  "Jeff Brazos":        { emoji: "📦", title: "Prime Overlord" },
  "Gill Bates":         { emoji: "🪟", title: "Ctrl+V Visionary" },
  "Warren Muffett":     { emoji: "📊", title: "The Oracle" },

  // 4★ SUPER RARE
  "Jensen Wrong":       { emoji: "🖥️", title: "GPU Daddy" },
  "Sham Bankman-Fraud": { emoji: "🏴‍☠️", title: "FTX'd" },
  "Peter Teal":         { emoji: "🧛", title: "Paypal Mafia Don" },
  "Tim Apple":          { emoji: "🍎", title: "One More Thing" },

  // 3★ RARE
  "Travis Kaladick":    { emoji: "🚗", title: "Surge Lord" },
  "Elizabeth Bones":    { emoji: "🧴", title: "Therablood" },
  "Adam Newmann":       { emoji: "🏢", title: "WeWork't" },
  "Marc Handreessen":   { emoji: "🦈", title: "a16z'd" },
  "Vitality Butterkin": { emoji: "🎰", title: "Gas Fee God" },

  // 2★ UNCOMMON
  "Gwyneth Grifrow":   { emoji: "🕯️", title: "Goop Queen" },
  "Gary Vee-Nah":      { emoji: "📈", title: "Hustle Emperor" },
  "Joe Rogaine":       { emoji: "🎙️", title: "The Podcaster" },
  "Logan Pall":        { emoji: "🎨", title: "CryptoZoo Boy" },
  "Jack Dorsal":       { emoji: "🧘", title: "Decentralize Bro" },

  // 1★ COMMON
  "Unpaid Intern":     { emoji: "👨‍💻", title: "Code Monkey" },
  "LinkedIn Larry":    { emoji: "💼", title: "Thought Leader" },
  "Crypto Kyle":       { emoji: "🦍", title: "Diamond Hands" },
  "Hustle Hannah":     { emoji: "⏰", title: "Rise & Grind" },
  "Gig Greg":          { emoji: "🛵", title: "Side Hustler" },
};

export function getCharacterEmoji(name: string): string {
  return CHARACTER_META[name]?.emoji ?? "💸";
}

export function getCharacterTitle(name: string): string {
  return CHARACTER_META[name]?.title ?? "Mystery";
}
