import type { NormalizedCharacter } from "@/types/character";
import type { Readiness } from "@/types/analysis";
import { SCORING } from "@/config/scoring";
import { clamp, normMythicPlus } from "./normalize";

type RaidDifficulty = "normal" | "heroic" | "mythic";

/**
 * Item-level readiness toward a target ilvl. Reaching `target` (and beyond)
 * yields 100; falling `ilvlBand` below the target yields 0; linear between.
 */
function ilvlReadiness(eq: number, target: number): number {
  const { ilvlBand } = SCORING.readiness;
  if (ilvlBand <= 0) return eq >= target ? 100 : 0;
  return clamp(((eq - (target - ilvlBand)) / ilvlBand) * 100);
}

/**
 * Percentage of bosses killed at a given difficulty for the current raid.
 * 0 when there is no current raid or the raid has no bosses.
 */
export function raidProgress(
  c: NormalizedCharacter,
  diff: RaidDifficulty,
): number {
  const raid = c.currentRaid;
  if (!raid) return 0;
  const total = raid.totalBosses;
  if (total <= 0) return 0;

  const killedForDiff =
    diff === "normal"
      ? raid.normalKilled
      : diff === "heroic"
        ? raid.heroicKilled
        : raid.mythicKilled;

  return (killedForDiff / total) * 100;
}

/**
 * Deterministic, authoritative readiness scores (0-100). Mythic+ readiness is
 * the normalized rating; heroic/mythic raid readiness blend ilvl readiness
 * with actual progression at that difficulty.
 */
export function readiness(c: NormalizedCharacter): Readiness {
  const { heroicReadyIlvl, mythicReadyIlvl, ilvlBlend, progressBlend } =
    SCORING.readiness;
  const eq = c.itemLevel.equipped;

  const mythicPlus = Math.round(normMythicPlus(c.mythicPlus.ratingByRole));

  const heroicRaid = Math.round(
    ilvlReadiness(eq, heroicReadyIlvl) * ilvlBlend +
      raidProgress(c, "heroic") * progressBlend,
  );

  const mythicRaid = Math.round(
    ilvlReadiness(eq, mythicReadyIlvl) * ilvlBlend +
      raidProgress(c, "mythic") * progressBlend,
  );

  return { mythicPlus, heroicRaid, mythicRaid };
}
