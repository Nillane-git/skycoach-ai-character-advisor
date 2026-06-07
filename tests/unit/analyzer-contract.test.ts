import { describe, it, expect } from "vitest";
import { fallback } from "@/lib/analyze/fallback";
import { finalize } from "@/lib/analyze/finalize";
import { characterScore } from "@/lib/scoring/score";
import { readiness } from "@/lib/scoring/readiness";
import { SKYCOACH_CARDS } from "@/config/skycoach";
import type { Analysis } from "@/types/analysis";
import type { AnalysisNumbers } from "@/lib/analyze/prompt";
import { makeCharacter, makeZeroCharacter, makeMaxCharacter } from "./_fixtures";

function numbersFor(c: ReturnType<typeof makeCharacter>): AnalysisNumbers {
  return { characterScore: characterScore(c), readiness: readiness(c) };
}

function inRange(n: number, lo: number, hi: number): boolean {
  return n >= lo && n <= hi;
}

function assertAnalysisShape(a: Analysis): void {
  expect(typeof a.characterScore).toBe("number");
  expect(a.readiness).toMatchObject({
    mythicPlus: expect.any(Number),
    heroicRaid: expect.any(Number),
    mythicRaid: expect.any(Number),
  });
  expect(Array.isArray(a.strengths)).toBe(true);
  expect(Array.isArray(a.weaknesses)).toBe(true);
  expect(Array.isArray(a.bottlenecks)).toBe(true);
  expect(Array.isArray(a.actionPlan)).toBe(true);
  expect(Array.isArray(a.roadmap)).toBe(true);
  expect(Array.isArray(a.skycoachSuggestions)).toBe(true);
}

// A few characters exercising different weakest-metric branches.
const SAMPLES = [
  makeZeroCharacter(),
  makeMaxCharacter(),
  makeCharacter(), // mid default
  makeCharacter({ currentRaid: null }),
];

describe("fallback() contract", () => {
  it("produces a valid Analysis shape", () => {
    for (const c of SAMPLES) {
      assertAnalysisShape(fallback(c, numbersFor(c)));
    }
  });

  it("finalizes every character to the full [min,max] bands with no duplicate items", () => {
    // finalize(fallback(...)) is the exact pipeline production runs with no key.
    // Even the lopsided extremes — an all-zero character (few natural strengths)
    // and an all-maxed character (few natural weaknesses) — must reach every
    // floor with DISTINCT items. The fallback pools are sized to guarantee
    // enough distinct lines and clampCount de-duplicates while padding, so the
    // near-BiS / all-zero duplicate-padding bug cannot recur.
    const noDupes = (items: unknown[]) => {
      const keys = items.map((x) =>
        typeof x === "string" ? x : JSON.stringify(x),
      );
      expect(new Set(keys).size).toBe(keys.length);
    };

    for (const c of SAMPLES) {
      const numbers = numbersFor(c);
      const a = finalize(fallback(c, numbers), numbers, c);

      expect(inRange(a.strengths.length, 3, 5)).toBe(true);
      expect(inRange(a.weaknesses.length, 3, 5)).toBe(true);
      expect(inRange(a.bottlenecks.length, 2, 4)).toBe(true);
      expect(inRange(a.actionPlan.length, 4, 6)).toBe(true);
      expect(inRange(a.roadmap.length, 3, 5)).toBe(true);
      expect(a.skycoachSuggestions.length).toBe(3);

      noDupes(a.strengths);
      noDupes(a.weaknesses);
      noDupes(a.bottlenecks);
      noDupes(a.actionPlan);
      noDupes(a.roadmap);
    }
  });

  it("gives every bottleneck a non-empty title + explanation", () => {
    for (const c of SAMPLES) {
      const a = fallback(c, numbersFor(c));
      for (const b of a.bottlenecks) {
        expect(b.title.trim().length).toBeGreaterThan(0);
        expect(b.explanation.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("numbers roadmap steps sequentially from 1", () => {
    for (const c of SAMPLES) {
      const a = fallback(c, numbersFor(c));
      a.roadmap.forEach((step, i) => {
        expect(step.step).toBe(i + 1);
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.detail.trim().length).toBeGreaterThan(0);
      });
    }
  });

  it("is pure & deterministic — same input serializes identically twice", () => {
    for (const c of SAMPLES) {
      const numbers = numbersFor(c);
      const first = JSON.stringify(fallback(c, numbers));
      const second = JSON.stringify(fallback(c, numbers));
      expect(first).toBe(second);
    }
  });

  it("enforces exactly the 3 fixed skycoach cards (titles + CTAs)", () => {
    for (const c of SAMPLES) {
      const a = fallback(c, numbersFor(c));
      expect(a.skycoachSuggestions.map((s) => s.title)).toEqual(
        SKYCOACH_CARDS.map((card) => card.title),
      );
      expect(a.skycoachSuggestions.map((s) => s.cta)).toEqual(
        SKYCOACH_CARDS.map((card) => card.cta),
      );
    }
  });
});

describe("finalize() contract", () => {
  it("overwrites whatever numbers the model returned with the authoritative ones", () => {
    const c = makeCharacter();
    const numbers = numbersFor(c);

    // A bogus Claude-style analysis with WRONG numbers and minimal text.
    const bogus: Analysis = {
      characterScore: 9999,
      readiness: { mythicPlus: -1, heroicRaid: 12345, mythicRaid: -42 },
      strengths: ["s1", "s2", "s3"],
      weaknesses: ["w1", "w2", "w3"],
      bottlenecks: [
        { title: "b1", explanation: "x" },
        { title: "b2", explanation: "y" },
      ],
      actionPlan: ["a1", "a2", "a3", "a4"],
      roadmap: [
        { step: 7, title: "r1", detail: "d1" },
        { step: 8, title: "r2", detail: "d2" },
        { step: 9, title: "r3", detail: "d3" },
      ],
      skycoachSuggestions: [
        { title: "WRONG", description: "kept desc 1", cta: "WRONG" },
        { title: "WRONG", description: "kept desc 2", cta: "WRONG" },
        { title: "WRONG", description: "kept desc 3", cta: "WRONG" },
      ],
    };

    const out = finalize(bogus, numbers, c);

    expect(out.characterScore).toBe(numbers.characterScore);
    expect(out.readiness).toEqual(numbers.readiness);
    // the bogus values must be gone
    expect(out.characterScore).not.toBe(9999);
  });

  it("pads counts up to the floor when the model returns too few", () => {
    const c = makeCharacter();
    const numbers = numbersFor(c);

    const tooFew: Analysis = {
      characterScore: 0,
      readiness: { mythicPlus: 0, heroicRaid: 0, mythicRaid: 0 },
      strengths: ["only one"],
      weaknesses: ["only one"],
      bottlenecks: [{ title: "only one", explanation: "x" }],
      actionPlan: ["only one"],
      roadmap: [{ step: 1, title: "only one", detail: "d" }],
      skycoachSuggestions: [],
    };

    const out = finalize(tooFew, numbers, c);

    expect(out.strengths.length).toBeGreaterThanOrEqual(3);
    expect(out.weaknesses.length).toBeGreaterThanOrEqual(3);
    expect(out.bottlenecks.length).toBeGreaterThanOrEqual(2);
    expect(out.actionPlan.length).toBeGreaterThanOrEqual(4);
    expect(out.roadmap.length).toBeGreaterThanOrEqual(3);
    expect(out.skycoachSuggestions.length).toBe(3);
    // roadmap renumbered from 1
    out.roadmap.forEach((s, i) => expect(s.step).toBe(i + 1));
  });

  it("slices counts down to the ceiling when the model returns too many", () => {
    const c = makeCharacter();
    const numbers = numbersFor(c);

    const tooMany: Analysis = {
      characterScore: 0,
      readiness: { mythicPlus: 0, heroicRaid: 0, mythicRaid: 0 },
      strengths: ["1", "2", "3", "4", "5", "6", "7"],
      weaknesses: ["1", "2", "3", "4", "5", "6", "7"],
      bottlenecks: [
        { title: "1", explanation: "x" },
        { title: "2", explanation: "x" },
        { title: "3", explanation: "x" },
        { title: "4", explanation: "x" },
        { title: "5", explanation: "x" },
      ],
      actionPlan: ["1", "2", "3", "4", "5", "6", "7", "8"],
      roadmap: [
        { step: 1, title: "1", detail: "d" },
        { step: 2, title: "2", detail: "d" },
        { step: 3, title: "3", detail: "d" },
        { step: 4, title: "4", detail: "d" },
        { step: 5, title: "5", detail: "d" },
        { step: 6, title: "6", detail: "d" },
      ],
      skycoachSuggestions: [
        { title: "x", description: "d1", cta: "y" },
        { title: "x", description: "d2", cta: "y" },
        { title: "x", description: "d3", cta: "y" },
        { title: "x", description: "d4", cta: "y" },
      ],
    };

    const out = finalize(tooMany, numbers, c);

    expect(out.strengths.length).toBe(5);
    expect(out.weaknesses.length).toBe(5);
    expect(out.bottlenecks.length).toBe(4);
    expect(out.actionPlan.length).toBe(6);
    expect(out.roadmap.length).toBe(5);
    expect(out.skycoachSuggestions.length).toBe(3);
  });

  it("forces exactly the 3 fixed skycoach cards but keeps the model's descriptions", () => {
    const c = makeCharacter();
    const numbers = numbersFor(c);

    const a: Analysis = {
      ...fallback(c, numbers),
      skycoachSuggestions: [
        { title: "junk", description: "tailored desc A", cta: "junk" },
        { title: "junk", description: "tailored desc B", cta: "junk" },
        { title: "junk", description: "tailored desc C", cta: "junk" },
      ],
    };

    const out = finalize(a, numbers, c);

    expect(out.skycoachSuggestions.map((s) => s.title)).toEqual(
      SKYCOACH_CARDS.map((card) => card.title),
    );
    expect(out.skycoachSuggestions.map((s) => s.cta)).toEqual(
      SKYCOACH_CARDS.map((card) => card.cta),
    );
    expect(out.skycoachSuggestions.map((s) => s.description)).toEqual([
      "tailored desc A",
      "tailored desc B",
      "tailored desc C",
    ]);
  });
});
