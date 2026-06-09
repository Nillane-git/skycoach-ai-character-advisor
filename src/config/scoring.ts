// UPDATE EACH SEASON — season-coupled ceilings
//
// This is the ONE place progression ceilings/weights live. Every scoring,
// readiness and normalization formula reads from here. When a new WoW season
// ships, bump itemLevel.{floor,cap}, mythicPlus.cap, readiness.*Ilvl, and the
// dungeon poolSize to match the live season.

// Current target: The War Within: Midnight — Season 1 (what Raider.IO returns
// for `mythic_plus_scores_by_season:current`). Item levels are on the ~level-90
// Midnight scale (fresh ~220, Mythic best-in-slot ~290); Mythic+ title range is
// ~3500. Bump these every season.
export const SCORING = {
  weights: { itemLevel: 0.4, mythicPlus: 0.3, raid: 0.2, dungeons: 0.1 },
  itemLevel: { floor: 220, cap: 290 },
  mythicPlus: { cap: 3500 },
  dungeons: { poolSize: 8, keystoneFloor: 10 },
  raid: { normal: 1, heroic: 2, mythic: 3 },
  readiness: {
    heroicReadyIlvl: 255,
    mythicReadyIlvl: 278,
    ilvlBand: 20,
    ilvlBlend: 0.6,
    progressBlend: 0.4,
  },
} as const;
