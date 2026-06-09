import { describe, it, expect } from "vitest";
import { characterScore } from "@/lib/scoring/score";
import {
  makeCharacter,
  makeZeroCharacter,
  makeMaxCharacter,
  makeRaid,
} from "./_fixtures";

describe("characterScore", () => {
  it("scores a zero-data character at 0", () => {
    expect(characterScore(makeZeroCharacter())).toBe(0);
  });

  it("scores a full BiS mythic raider at 100", () => {
    expect(characterScore(makeMaxCharacter())).toBe(100);
  });

  it("matches a hand-computed mid character", () => {
    // ilvl 255 -> 50, mplus 1750 -> 50, raid 8 heroic of 8 -> 66.67,
    // coverage 4/8 -> 50.
    // 50*0.40 + 50*0.30 + 66.67*0.20 + 50*0.10
    //  = 20 + 15 + 13.33 + 5 = 53.33 -> round 53
    const c = makeCharacter({
      itemLevel: { equipped: 255, total: 258 },
      mythicPlus: {
        ratingAll: 1750,
        ratingByRole: 1750,
        bestRuns: [],
        distinctDungeonsAtOrAbove10: 4,
      },
      currentRaid: makeRaid({ heroicKilled: 8, summary: "8/8 H" }),
    });
    expect(characterScore(c)).toBe(53);
  });

  it("treats a null currentRaid as a 0 raid term (still valid)", () => {
    // Same as mid but with no raid: raid term drops from 13.33 to 0.
    // 50*0.40 + 50*0.30 + 0 + 50*0.10 = 20 + 15 + 0 + 5 = 40
    const c = makeCharacter({
      itemLevel: { equipped: 255, total: 258 },
      mythicPlus: {
        ratingAll: 1750,
        ratingByRole: 1750,
        bestRuns: [],
        distinctDungeonsAtOrAbove10: 4,
      },
      currentRaid: null,
    });
    const score = characterScore(c);
    expect(score).toBe(40);
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
