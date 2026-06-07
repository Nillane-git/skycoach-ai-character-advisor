import type { NormalizedCharacter } from "@/types/character";
import type { Analysis, RoadmapStep } from "@/types/analysis";
import { SKYCOACH_CARDS } from "@/config/skycoach";
import { fallback } from "@/lib/analyze/fallback";
import type { AnalysisNumbers } from "@/lib/analyze/prompt";

function dedupeKey<T>(item: T): string {
  return typeof item === "string" ? item : JSON.stringify(item);
}

/**
 * Clamp an array to [min, max]:
 *  - de-duplicate the incoming items (Claude or fallback can repeat lines),
 *  - keep up to `max` distinct items,
 *  - if still below `min`, pad from the deterministic `pad` source, skipping any
 *    item already present so padding never introduces duplicates.
 * The fallback pools are sized to always supply enough distinct items to reach
 * the floor, so the [min,max] contract holds for both the Claude and fallback
 * paths.
 */
function clampCount<T>(arr: T[], min: number, max: number, pad: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const key = dedupeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= max) return out;
  }
  for (const item of pad) {
    if (out.length >= min) break;
    const key = dedupeKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

/**
 * Finalize a (possibly Claude-authored) analysis:
 *  1. Overwrite the authoritative numbers (characterScore, readiness).
 *  2. Clamp every array count to its required band, padding from the
 *     deterministic fallback when short.
 *  3. Renumber roadmap steps 1..n.
 *  4. Force skycoachSuggestions to exactly the 3 fixed cards (titles + CTAs
 *     from canon), keeping Claude's description when present & non-empty.
 */
export function finalize(
  a: Analysis,
  numbers: AnalysisNumbers,
  c: NormalizedCharacter,
): Analysis {
  const fb = fallback(c, numbers);

  // (1) Authoritative numbers always win.
  const characterScore = numbers.characterScore;
  const readiness = numbers.readiness;

  // (2) Clamp counts, padding from the fallback's matching arrays.
  const strengths = clampCount(a.strengths ?? [], 3, 5, fb.strengths);
  const weaknesses = clampCount(a.weaknesses ?? [], 3, 5, fb.weaknesses);
  const bottlenecks = clampCount(a.bottlenecks ?? [], 2, 4, fb.bottlenecks);
  const actionPlan = clampCount(a.actionPlan ?? [], 4, 6, fb.actionPlan);
  const roadmapRaw = clampCount(a.roadmap ?? [], 3, 5, fb.roadmap);

  // (3) Renumber roadmap steps.
  const roadmap: RoadmapStep[] = roadmapRaw.map((step, i) => ({
    step: i + 1,
    title: step.title,
    detail: step.detail,
  }));

  // (4) Force exactly the 3 fixed cards; keep Claude's description if usable.
  const claudeSuggestions = a.skycoachSuggestions ?? [];
  const skycoachSuggestions = SKYCOACH_CARDS.map((card, i) => {
    const fromClaude = claudeSuggestions[i]?.description;
    const description =
      typeof fromClaude === "string" && fromClaude.trim().length > 0
        ? fromClaude
        : card.description;
    return {
      title: card.title,
      description,
      cta: card.cta,
    };
  });

  return {
    characterScore,
    readiness,
    strengths,
    weaknesses,
    bottlenecks,
    actionPlan,
    roadmap,
    skycoachSuggestions,
  };
}
