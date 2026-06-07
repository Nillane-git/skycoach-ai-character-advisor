import type { AnalysisResult } from "@/types/analysis";
import type { Region } from "@/types/character";
import { cacheGet, cacheKey, cacheSet } from "@/lib/cache";
import { isDemoCharacter, loadFixture } from "@/lib/demo";
import { fetchCharacter } from "@/lib/raiderio/client";
import { normalizeCharacter } from "@/lib/scoring/normalize-input";
import { analyze } from "@/lib/analyze";
import { env, hasAnthropicKey } from "@/lib/env";
import { AppError } from "@/lib/errors";

/**
 * The single orchestration entry point.
 *
 * cache → demo/fixture-or-fetch → normalizeCharacter → isEmpty guard
 *       → analyze → assemble meta → cacheSet.
 *
 * The deterministic scoring formulas (run inside `analyze`) are authoritative;
 * Claude only authors qualitative text. A cache hit short-circuits everything
 * and is returned with `meta.cached = true`.
 */
export async function runAnalysis(
  region: string,
  realm: string,
  name: string,
): Promise<AnalysisResult> {
  const key = cacheKey(region, realm, name);

  // --- Cache hit ------------------------------------------------------------
  const hit = cacheGet<AnalysisResult>(key);
  if (hit) {
    return { ...hit, meta: { ...hit.meta, cached: true } };
  }

  // --- Source: fixture (demo / DEMO_MODE) or live fetch ---------------------
  const useFixture = env.DEMO_MODE || isDemoCharacter(region, realm, name);
  const raw = useFixture
    ? loadFixture()
    : await fetchCharacter({ region, realm, name });

  // --- Normalize ------------------------------------------------------------
  const character = normalizeCharacter(raw, region as Region);

  // --- Empty / malformed guard ---------------------------------------------
  if (character.flags.isEmpty) {
    throw new AppError("EMPTY_OR_MALFORMED", "No progression data yet.");
  }

  // --- Analyze (numbers deterministic, text from Claude or fallback) --------
  const { analysis, source } = await analyze(character);

  // --- Assemble + cache -----------------------------------------------------
  const result: AnalysisResult = {
    character,
    analysis,
    meta: {
      source,
      cached: false,
      usedFixture: useFixture,
      keyExpected: hasAnthropicKey(),
    },
  };

  cacheSet(key, result);
  return result;
}
