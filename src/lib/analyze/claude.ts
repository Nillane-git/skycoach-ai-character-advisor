import Anthropic from "@anthropic-ai/sdk";
import type { NormalizedCharacter } from "@/types/character";
import type { Analysis } from "@/types/analysis";
import { ANALYSIS_SCHEMA } from "@/lib/analyze/schema";
import {
  buildSystemPrompt,
  buildUserPrompt,
  type AnalysisNumbers,
} from "@/lib/analyze/prompt";

const client = new Anthropic({ maxRetries: 1 });

/**
 * Call Claude to author the qualitative analysis. Numbers in the response are
 * shape-only — `finalize` overwrites them with the authoritative formula values
 * and clamps array counts. This function only produces the raw text JSON.
 *
 * Uses adaptive thinking + json_schema structured output. No temperature/top_p/
 * top_k/budget_tokens — those are removed on claude-opus-4-8 and 400 if sent.
 */
export async function claudeAnalyze(
  c: NormalizedCharacter,
  numbers: AnalysisNumbers,
): Promise<Analysis> {
  const res = await client.messages.create(
    // `output_config` is not yet in the SDK's typed params — cast the whole
    // params object to bypass typing while keeping the runtime shape correct.
    {
      model: "claude-opus-4-8",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: {
        format: { type: "json_schema", schema: ANALYSIS_SCHEMA },
      },
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: buildUserPrompt(c, numbers) }],
    } as unknown as Anthropic.Messages.MessageCreateParamsNonStreaming,
    { signal: AbortSignal.timeout(20000) },
  );

  const text = res.content.find((b) => b.type === "text")?.text;

  if (res.stop_reason === "refusal" || !text) {
    throw new Error("claude analyze refused or returned no text");
  }

  // Shape only — finalize fixes counts & overwrites the authoritative numbers.
  return JSON.parse(text) as Analysis;
}
