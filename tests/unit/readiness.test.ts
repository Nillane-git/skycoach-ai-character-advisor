import { describe, it, expect } from "vitest";
import { readiness } from "@/lib/scoring/readiness";
import { normMythicPlus } from "@/lib/scoring/normalize";
import { makeCharacter, makeRaid } from "./_fixtures";

describe("readiness", () => {
  it("mythicPlus mirrors normMythicPlus(ratingByRole)", () => {
    const ratings = [0, 750, 1500, 2400, 3000, 3500];
    for (const r of ratings) {
      const c = makeCharacter({
        mythicPlus: {
          ratingAll: r,
          ratingByRole: r,
          bestRuns: [],
          distinctDungeonsAtOrAbove10: 4,
        },
      });
      expect(readiness(c).mythicPlus).toBe(Math.round(normMythicPlus(r)));
    }
  });

  it("heroic readiness is high at the ilvl threshold + full progress, low far below with none", () => {
    // At threshold: eq=255 (heroicReadyIlvl), 8/8 heroic -> 100*0.6 + 100*0.4 = 100
    const atThreshold = makeCharacter({
      itemLevel: { equipped: 255, total: 255 },
      currentRaid: makeRaid({ heroicKilled: 8, summary: "8/8 H" }),
    });
    // Far below: eq=220 (a full band under target), 0 progress -> 0*0.6 + 0*0.4 = 0
    const farBelow = makeCharacter({
      itemLevel: { equipped: 220, total: 220 },
      currentRaid: makeRaid({ heroicKilled: 0 }),
    });

    expect(readiness(atThreshold).heroicRaid).toBe(100);
    expect(readiness(farBelow).heroicRaid).toBe(0);
    expect(readiness(atThreshold).heroicRaid).toBeGreaterThan(
      readiness(farBelow).heroicRaid,
    );
  });

  it("mythic readiness is high at the ilvl threshold + full progress, low far below with none", () => {
    // At threshold: eq=278 (mythicReadyIlvl), 8/8 mythic -> 100*0.6 + 100*0.4 = 100
    const atThreshold = makeCharacter({
      itemLevel: { equipped: 278, total: 278 },
      currentRaid: makeRaid({ mythicKilled: 8, summary: "8/8 M" }),
    });
    // Far below: eq=220, 0 mythic kills -> 0
    const farBelow = makeCharacter({
      itemLevel: { equipped: 220, total: 220 },
      currentRaid: makeRaid({ mythicKilled: 0 }),
    });

    expect(readiness(atThreshold).mythicRaid).toBe(100);
    expect(readiness(farBelow).mythicRaid).toBe(0);
    expect(readiness(atThreshold).mythicRaid).toBeGreaterThan(
      readiness(farBelow).mythicRaid,
    );
  });

  it("zeroes the progress component when there is no raid", () => {
    // High ilvl, but no raid -> the progress half of heroic/mythic must be 0.
    // eq=290 -> ilvlReadiness saturates to 100 for both targets.
    // heroic = 100*0.6 + 0*0.4 = 60 ; mythic = 100*0.6 + 0*0.4 = 60.
    const c = makeCharacter({
      itemLevel: { equipped: 290, total: 290 },
      currentRaid: null,
    });
    const r = readiness(c);
    expect(r.heroicRaid).toBe(60);
    expect(r.mythicRaid).toBe(60);
  });
});
