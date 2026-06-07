import type { NormalizedCharacter } from "@/types/character";
import type { Analysis, AnalysisSource } from "@/types/analysis";
import { characterScore } from "@/lib/scoring/score";
import { readiness } from "@/lib/scoring/readiness";
import { hasAnthropicKey } from "@/lib/env";
import { claudeAnalyze } from "@/lib/analyze/claude";
import { fallback } from "@/lib/analyze/fallback";
import { finalize } from "@/lib/analyze/finalize";
import type { AnalysisNumbers } from "@/lib/analyze/prompt";

/**
 * Single entry point for producing an analysis. The authoritative numbers are
 * always computed by the deterministic formulas; the qualitative text comes
 * from Claude when a key is present (falling back deterministically on any
 * error), or from the deterministic fallback otherwise. Both paths run through
 * `finalize`, so counts and numbers are guaranteed regardless of source.
 */
export async function analyze(
  c: NormalizedCharacter,
): Promise<{ analysis: Analysis; source: AnalysisSource }> {
  const numbers: AnalysisNumbers = {
    characterScore: characterScore(c),
    readiness: readiness(c),
  };

  if (!hasAnthropicKey()) {
    return {
      analysis: finalize(fallback(c, numbers), numbers, c),
      source: "fallback",
    };
  }

  try {
    const a = await claudeAnalyze(c, numbers);
    return { analysis: finalize(a, numbers, c), source: "claude" };
  } catch (e) {
    console.error("[analyze] claude failed, using fallback:", e);
    return {
      analysis: finalize(fallback(c, numbers), numbers, c),
      source: "fallback",
    };
  }
}
