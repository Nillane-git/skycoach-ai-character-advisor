import { describe, it, expect } from "vitest";
import type { RaiderIoProfile } from "@/lib/raiderio/types";
import type { Region } from "@/types/character";
import { normalizeCharacter } from "@/lib/scoring/normalize-input";
import { characterScore } from "@/lib/scoring/score";
import { readiness } from "@/lib/scoring/readiness";
import { fallback } from "@/lib/analyze/fallback";
import { finalize } from "@/lib/analyze/finalize";

import demo from "../../fixtures/raiderio/demo-character.json";
import noMplus from "../../fixtures/raiderio/no-mplus.json";
import healer from "../../fixtures/raiderio/healer.json";
import fresh from "../../fixtures/raiderio/fresh.json";

const FIXTURES: { name: string; raw: RaiderIoProfile }[] = [
  { name: "demo-character", raw: demo as RaiderIoProfile },
  { name: "no-mplus", raw: noMplus as RaiderIoProfile },
  { name: "healer", raw: healer as RaiderIoProfile },
  { name: "fresh", raw: fresh as RaiderIoProfile },
];

const hasCyrillic = (s: string) => /[а-яА-ЯёЁ]/.test(s);
const inRange = (n: number, lo: number, hi: number) => n >= lo && n <= hi;
const isInt0to100 = (n: number) => Number.isInteger(n) && n >= 0 && n <= 100;

describe("full pipeline over every fixture", () => {
  for (const { name, raw } of FIXTURES) {
    describe(name, () => {
      const c = normalizeCharacter(raw, "us" as Region);
      const numbers = { characterScore: characterScore(c), readiness: readiness(c) };
      const analysis = finalize(fallback(c, numbers), numbers, c);

      it("normalizes identity and picks the current raid by expansion_id", () => {
        expect(c.identity.name).toBe(raw.name);
        expect(["DPS", "HEALER", "TANK"]).toContain(c.identity.role);
        // The selector must pick a raid at the HIGHEST expansion_id (the current
        // tier), proving it keys on expansion_id rather than a hardcoded slug.
        if (raw.raid_progression && Object.keys(raw.raid_progression).length) {
          expect(c.currentRaid).not.toBeNull();
          const entries = Object.entries(raw.raid_progression);
          const maxExp = Math.max(...entries.map(([, v]) => v.expansion_id));
          const slugsAtMax = entries
            .filter(([, v]) => v.expansion_id === maxExp)
            .map(([k]) => k);
          expect(slugsAtMax).toContain(c.currentRaid!.slug);
        }
      });

      it("produces authoritative numbers in 0..100", () => {
        expect(isInt0to100(numbers.characterScore)).toBe(true);
        expect(isInt0to100(numbers.readiness.mythicPlus)).toBe(true);
        expect(isInt0to100(numbers.readiness.heroicRaid)).toBe(true);
        expect(isInt0to100(numbers.readiness.mythicRaid)).toBe(true);
      });

      it("finalizes to the full count bands with no duplicates", () => {
        expect(inRange(analysis.strengths.length, 3, 5)).toBe(true);
        expect(inRange(analysis.weaknesses.length, 3, 5)).toBe(true);
        expect(inRange(analysis.bottlenecks.length, 2, 4)).toBe(true);
        expect(inRange(analysis.actionPlan.length, 4, 6)).toBe(true);
        expect(inRange(analysis.roadmap.length, 3, 5)).toBe(true);
        expect(analysis.skycoachSuggestions.length).toBe(3);

        const noDupes = (xs: unknown[]) => {
          const keys = xs.map((x) => (typeof x === "string" ? x : JSON.stringify(x)));
          expect(new Set(keys).size).toBe(keys.length);
        };
        noDupes(analysis.strengths);
        noDupes(analysis.weaknesses);
        noDupes(analysis.bottlenecks);
        noDupes(analysis.actionPlan);
        noDupes(analysis.roadmap);

        analysis.roadmap.forEach((s, i) => expect(s.step).toBe(i + 1));
      });

      it("renders every generated text field in Russian (no English leak)", () => {
        const texts = [
          ...analysis.strengths,
          ...analysis.weaknesses,
          ...analysis.bottlenecks.flatMap((b) => [b.title, b.explanation]),
          ...analysis.actionPlan,
          ...analysis.roadmap.flatMap((r) => [r.title, r.detail]),
          ...analysis.skycoachSuggestions.flatMap((s) => [s.title, s.description, s.cta]),
        ];
        for (const t of texts) {
          expect(t.trim().length, `empty text field in ${name}`).toBeGreaterThan(0);
          expect(hasCyrillic(t), `non-Russian text "${t}" in ${name}`).toBe(true);
        }
      });
    });
  }

  it("uses the role-appropriate Mythic+ rating (healer score, not DPS)", () => {
    const c = normalizeCharacter(healer as RaiderIoProfile, "us" as Region);
    expect(c.identity.role).toBe("HEALER");
    const scores = (healer as RaiderIoProfile).mythic_plus_scores_by_season![0].scores;
    expect(c.mythicPlus.ratingByRole).toBe(scores.healer);
    expect(c.mythicPlus.ratingByRole).not.toBe(scores.dps);
  });

  it("handles a character with no Mythic+ runs", () => {
    const c = normalizeCharacter(noMplus as RaiderIoProfile, "us" as Region);
    expect(c.mythicPlus.bestRuns.length).toBe(0);
    expect(c.mythicPlus.distinctDungeonsAtOrAbove10).toBe(0);
    expect(c.mythicPlus.ratingByRole).toBe(0);
    expect(c.flags.hasMythicPlus).toBe(false);
    // Still a valid, analyzable character (it has gear + raid progress).
    expect(c.flags.isEmpty).toBe(false);
  });
});
