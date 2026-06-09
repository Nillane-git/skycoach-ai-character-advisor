import { describe, it, expect } from "vitest";
import { realmSlug, normalizeName } from "@/lib/raiderio/slug";

describe("realmSlug", () => {
  it("strips apostrophes without inserting a separator", () => {
    expect(realmSlug("Kel'Thuzad")).toBe("kelthuzad");
  });

  it("lowercases and replaces spaces with hyphens", () => {
    expect(realmSlug("Twisting Nether")).toBe("twisting-nether");
  });

  it("trims surrounding whitespace and collapses inner runs", () => {
    expect(realmSlug("  Twisting  Nether  ")).toBe("twisting-nether");
  });

  it("drops stray punctuation", () => {
    expect(realmSlug("Area 52")).toBe("area-52");
  });

  it("keeps non-Latin (Cyrillic) realms instead of blanking them out", () => {
    // Regression: stripping all non-ASCII used to return "" for RU realms,
    // which made the home-page submit silently no-op ("button doesn't work").
    expect(realmSlug("Гордунни")).toBe("гордунни");
    expect(realmSlug("Ревущий фьорд")).toBe("ревущий-фьорд");
    expect(realmSlug("Азурегос")).not.toBe("");
  });
});

describe("normalizeName", () => {
  it("trims the character name", () => {
    expect(normalizeName("  Skycoach  ")).toBe("Skycoach");
  });
});
