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
});

describe("normalizeName", () => {
  it("trims the character name", () => {
    expect(normalizeName("  Skycoach  ")).toBe("Skycoach");
  });
});
