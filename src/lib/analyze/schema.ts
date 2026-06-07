/**
 * JSON Schema for the AI analysis output (shape-only).
 *
 * Mirrors the `Analysis` type in `@/types/analysis` EXACTLY in shape. Per the
 * structured-outputs constraints, we use `additionalProperties: false` and mark
 * every key required, but we deliberately OMIT `minItems`/`maxItems` (unsupported
 * by the API's json_schema format). Array-count clamping is enforced afterwards
 * by `finalize`, and the authoritative numbers (`characterScore`, `readiness`)
 * are overwritten there too — Claude only authors qualitative text.
 */
export const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "characterScore",
    "readiness",
    "strengths",
    "weaknesses",
    "bottlenecks",
    "actionPlan",
    "roadmap",
    "skycoachSuggestions",
  ],
  properties: {
    characterScore: { type: "integer" },
    readiness: {
      type: "object",
      additionalProperties: false,
      required: ["mythicPlus", "heroicRaid", "mythicRaid"],
      properties: {
        mythicPlus: { type: "integer" },
        heroicRaid: { type: "integer" },
        mythicRaid: { type: "integer" },
      },
    },
    strengths: {
      type: "array",
      items: { type: "string" },
    },
    weaknesses: {
      type: "array",
      items: { type: "string" },
    },
    bottlenecks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "explanation"],
        properties: {
          title: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    actionPlan: {
      type: "array",
      items: { type: "string" },
    },
    roadmap: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["step", "title", "detail"],
        properties: {
          step: { type: "integer" },
          title: { type: "string" },
          detail: { type: "string" },
        },
      },
    },
    skycoachSuggestions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "cta"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          cta: { type: "string" },
        },
      },
    },
  },
} as const;
