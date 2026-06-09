// WoW item-rarity scale — reused for score/readiness tiers across the dashboard.
// Keep these in sync with the CSS custom properties in app/globals.css.

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_COLORS: Record<RarityTier, string> = {
  common: "#b6bcc6",
  uncommon: "#36d44b",
  rare: "#2a8cff",
  epic: "#b657ff",
  legendary: "#ff9d2e",
};

const RARITY_LABEL_RU: Record<RarityTier, string> = {
  common: "Обычно",
  uncommon: "Необычно",
  rare: "Редко",
  epic: "Эпично",
  legendary: "Легендарно",
};

/** Map a 0-100 score to a rarity tier. Thresholds mirror the score bands. */
export function rarityForScore(score: number): RarityTier {
  if (score >= 85) return "legendary";
  if (score >= 70) return "epic";
  if (score >= 50) return "rare";
  if (score >= 30) return "uncommon";
  return "common";
}

export function rarityColor(score: number): string {
  return RARITY_COLORS[rarityForScore(score)];
}

export function rarityLabel(score: number): string {
  return RARITY_LABEL_RU[rarityForScore(score)];
}
