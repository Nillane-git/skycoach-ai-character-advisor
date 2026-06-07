import { SCORING } from "@/config/scoring";

/**
 * Clamp a value into [lo, hi]. Defaults to the 0-100 percentage band used by
 * every normalization helper below.
 */
export function clamp(v: number, lo = 0, hi = 100): number {
  if (Number.isNaN(v)) return lo;
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

/**
 * Normalize equipped item level to a 0-100 score against the season's
 * floor/cap ceilings.
 */
export function normItemLevel(eq: number): number {
  const { floor, cap } = SCORING.itemLevel;
  const span = cap - floor;
  if (span <= 0) return 0;
  return clamp(((eq - floor) / span) * 100);
}

/**
 * Normalize a Mythic+ rating to 0-100 against the season cap.
 */
export function normMythicPlus(r: number): number {
  const { cap } = SCORING.mythicPlus;
  if (cap <= 0) return 0;
  return clamp((r / cap) * 100);
}

/**
 * Normalize raid progression to 0-100. Each kill is weighted by difficulty
 * (normal=1, heroic=2, mythic=3) against the maximum possible (total * 3).
 */
export function normRaid(
  n: number,
  h: number,
  m: number,
  total: number,
): number {
  if (total <= 0) return 0;
  const { normal, heroic, mythic } = SCORING.raid;
  const earned = n * normal + h * heroic + m * mythic;
  const max = total * mythic;
  if (max <= 0) return 0;
  return clamp((earned / max) * 100);
}

/**
 * Normalize dungeon coverage (distinct dungeons cleared at/above the keystone
 * floor) to 0-100 against the season pool size.
 */
export function normDungeonCoverage(distinct: number): number {
  const { poolSize } = SCORING.dungeons;
  if (poolSize <= 0) return 0;
  return clamp((distinct / poolSize) * 100);
}
