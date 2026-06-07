import type { NormalizedCharacter } from "@/types/character";
import type { Readiness } from "@/types/analysis";
import { SCORING } from "@/config/scoring";

/**
 * The deterministic, formula-derived numbers that are AUTHORITATIVE for an
 * analysis. Both the prompt (so Claude references them verbatim) and `finalize`
 * (so they overwrite whatever Claude returned) consume this exact shape.
 */
export interface AnalysisNumbers {
  characterScore: number;
  readiness: Readiness;
}

export function buildSystemPrompt(): string {
  return [
    "You are SkyCoach, a premium AI World of Warcraft progression advisor.",
    "The characterScore and readiness numbers in the input are AUTHORITATIVE facts",
    "computed deterministically — reference and explain them, never recompute or",
    "contradict them, and copy them verbatim into the JSON number fields.",
    "Author ONLY qualitative text.",
    "",
    "Counts: strengths 3-5, weaknesses 3-5, bottlenecks 2-4 (each title + a",
    "one-sentence explanation of WHY it blocks progress), actionPlan 4-6 (specific",
    "& actionable, e.g. 'Complete 4 more +10 dungeons for full coverage', never",
    "'play more'), roadmap 3-5 ordered steps (step, title, detail).",
    "",
    "skycoachSuggestions: use exactly these 3 titles/CTAs — 'Progress Faster' /",
    "'Explore Options', 'Get Expert Guidance' / 'Learn More', 'Accelerate Character",
    "Growth' / 'View Services' — but tailor each description to the character's",
    "weakest findings.",
    "",
    "Tone: confident expert coach, NOT a sales pitch; SkyCoach are optional",
    "acceleration paths tied to real findings. Return ONLY JSON.",
  ].join("\n");
}

export function buildUserPrompt(
  c: NormalizedCharacter,
  numbers: AnalysisNumbers,
): string {
  const { identity, itemLevel, mythicPlus, currentRaid } = c;

  const topRuns = mythicPlus.bestRuns.slice(0, 5).map((r) => ({
    dungeon: r.shortName || r.dungeon,
    level: r.level,
    upgrades: r.upgrades,
    score: r.score,
  }));

  const raid = currentRaid
    ? {
        name: currentRaid.name,
        summary: currentRaid.summary,
        totalBosses: currentRaid.totalBosses,
        normalKilled: currentRaid.normalKilled,
        heroicKilled: currentRaid.heroicKilled,
        mythicKilled: currentRaid.mythicKilled,
      }
    : null;

  const payload = {
    authoritativeNumbers: {
      characterScore: numbers.characterScore,
      readiness: numbers.readiness,
    },
    character: {
      name: identity.name,
      class: identity.className,
      spec: identity.spec,
      role: identity.role,
      faction: identity.faction,
      itemLevel: { equipped: itemLevel.equipped, total: itemLevel.total },
      mythicPlus: {
        rating: mythicPlus.ratingByRole,
        topRuns,
      },
      currentRaid: raid,
      dungeonCoverage: `${mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize}`,
    },
  };

  return JSON.stringify(payload);
}
