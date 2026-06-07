import type { NormalizedCharacter } from "@/types/character";
import { SCORING } from "@/config/scoring";
import {
  normItemLevel,
  normMythicPlus,
  normRaid,
  normDungeonCoverage,
} from "./normalize";

/**
 * Deterministic, authoritative character score in 0-100. Claude never computes
 * this — it only references the result. Weighted blend of the four normalized
 * sub-metrics. When the character has no current raid, the raid term is 0.
 */
export function characterScore(c: NormalizedCharacter): number {
  const { weights } = SCORING;

  const ilvlTerm = normItemLevel(c.itemLevel.equipped) * weights.itemLevel;
  const mplusTerm =
    normMythicPlus(c.mythicPlus.ratingByRole) * weights.mythicPlus;

  const raid = c.currentRaid;
  const raidNorm = raid
    ? normRaid(
        raid.normalKilled,
        raid.heroicKilled,
        raid.mythicKilled,
        raid.totalBosses,
      )
    : 0;
  const raidTerm = raidNorm * weights.raid;

  const dungeonTerm =
    normDungeonCoverage(c.mythicPlus.distinctDungeonsAtOrAbove10) *
    weights.dungeons;

  return Math.round(ilvlTerm + mplusTerm + raidTerm + dungeonTerm);
}
