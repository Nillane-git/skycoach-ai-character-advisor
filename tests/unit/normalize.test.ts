import { describe, it, expect } from "vitest";
import {
  clamp,
  normItemLevel,
  normMythicPlus,
  normRaid,
  normDungeonCoverage,
} from "@/lib/scoring/normalize";

// Season ceilings (from src/config/scoring.ts): ilvl floor 220 / cap 290,
// mplus cap 3500, dungeon poolSize 8, raid weights 1/2/3.

describe("clamp", () => {
  it("clamps into the default 0-100 band", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(150)).toBe(100);
    expect(clamp(42)).toBe(42);
  });

  it("returns the floor for NaN", () => {
    expect(clamp(Number.NaN)).toBe(0);
  });
});

describe("normItemLevel", () => {
  it("floors at and below the season floor", () => {
    expect(normItemLevel(215)).toBe(0);
    expect(normItemLevel(220)).toBe(0);
  });

  it("hits the midpoint at the half-span ilvl", () => {
    // (255 - 220) / (290 - 220) * 100 = 50
    expect(normItemLevel(255)).toBeCloseTo(50, 5);
  });

  it("caps at and above the season cap", () => {
    expect(normItemLevel(290)).toBe(100);
    expect(normItemLevel(300)).toBe(100);
  });
});

describe("normMythicPlus", () => {
  it("maps rating linearly against the cap and clamps", () => {
    expect(normMythicPlus(0)).toBe(0);
    expect(normMythicPlus(1750)).toBe(50);
    expect(normMythicPlus(3500)).toBe(100);
    expect(normMythicPlus(4000)).toBe(100);
  });
});

describe("normRaid", () => {
  it("returns 0 when there are no bosses", () => {
    expect(normRaid(5, 5, 5, 0)).toBe(0);
  });

  it("weights difficulties (normal 1 / heroic 2 / mythic 3) against total*3", () => {
    // 8 of 8 at each difficulty against max 8*3 = 24
    expect(normRaid(8, 0, 0, 8)).toBeCloseTo(33.33, 1); // 8/24
    expect(normRaid(0, 8, 0, 8)).toBeCloseTo(66.67, 1); // 16/24
    expect(normRaid(0, 0, 8, 8)).toBe(100); // 24/24
  });

  it("blends a mixed clear correctly", () => {
    // 2 normal + 3 heroic + 1 mythic = 2 + 6 + 3 = 11 against 24
    expect(normRaid(2, 3, 1, 8)).toBeCloseTo((11 / 24) * 100, 5);
  });
});

describe("normDungeonCoverage", () => {
  it("scales against the dungeon pool size and clamps", () => {
    expect(normDungeonCoverage(0)).toBe(0);
    expect(normDungeonCoverage(8)).toBe(100);
    expect(normDungeonCoverage(12)).toBe(100); // above pool clamps to 100
  });
});
