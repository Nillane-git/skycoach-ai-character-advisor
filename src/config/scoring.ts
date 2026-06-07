// UPDATE EACH SEASON — season-coupled ceilings
//
// This is the ONE place progression ceilings/weights live. Every scoring,
// readiness and normalization formula reads from here. When a new WoW season
// ships, bump itemLevel.{floor,cap}, mythicPlus.cap, readiness.*Ilvl, and the
// dungeon poolSize to match the live season.

export const SCORING = {
  weights: { itemLevel: 0.4, mythicPlus: 0.3, raid: 0.2, dungeons: 0.1 },
  itemLevel: { floor: 580, cap: 639 },
  mythicPlus: { cap: 3000 },
  dungeons: { poolSize: 8, keystoneFloor: 10 },
  raid: { normal: 1, heroic: 2, mythic: 3 },
  readiness: {
    heroicReadyIlvl: 606,
    mythicReadyIlvl: 619,
    ilvlBand: 20,
    ilvlBlend: 0.6,
    progressBlend: 0.4,
  },
} as const;
