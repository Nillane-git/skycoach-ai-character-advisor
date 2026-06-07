import { describe, it, expect } from "vitest";
import {
  pickCurrentRaid,
  raidDisplayName,
  type RaidProgressionEntry,
} from "@/lib/scoring/raid-selector";

// Deliberately use INVENTED / RENAMED raid slugs that do not exist in WoW.
// If the selector ever hardcoded a real raid slug these tests would fail —
// they pass only if selection is driven purely by expansion_id + kills.

function entry(p: Partial<RaidProgressionEntry>): RaidProgressionEntry {
  return {
    summary: "0/8",
    expansion_id: 0,
    total_bosses: 8,
    normal_bosses_killed: 0,
    heroic_bosses_killed: 0,
    mythic_bosses_killed: 0,
    ...p,
  };
}

describe("pickCurrentRaid", () => {
  it("picks the raid in the maximum expansion_id group", () => {
    const prog: Record<string, RaidProgressionEntry> = {
      "zzz-ancient-vault": entry({ expansion_id: 8, heroic_bosses_killed: 4 }),
      "qqq-newest-citadel": entry({ expansion_id: 11, heroic_bosses_killed: 2 }),
      "www-middle-keep": entry({ expansion_id: 9, mythic_bosses_killed: 1 }),
    };
    const picked = pickCurrentRaid(prog);
    expect(picked?.slug).toBe("qqq-newest-citadel");
  });

  it("on a tie of max expansion, returns the LAST entry with kills (newest touched)", () => {
    // Two entries share the max expansion_id (11); both have kills. RIO lists
    // oldest->newest, so the LAST one inserted wins.
    const prog: Record<string, RaidProgressionEntry> = {
      "aaa-old-tier": entry({ expansion_id: 11, heroic_bosses_killed: 8 }),
      "bbb-new-tier": entry({ expansion_id: 11, normal_bosses_killed: 3 }),
    };
    const picked = pickCurrentRaid(prog);
    expect(picked?.slug).toBe("bbb-new-tier");
  });

  it("falls back to the last entry of the max group when none in it have kills", () => {
    const prog: Record<string, RaidProgressionEntry> = {
      "ccc-touched-old-expansion": entry({
        expansion_id: 10,
        mythic_bosses_killed: 5,
      }),
      "ddd-fresh-tier-a": entry({ expansion_id: 12 }),
      "eee-fresh-tier-b": entry({ expansion_id: 12 }),
    };
    const picked = pickCurrentRaid(prog);
    expect(picked?.slug).toBe("eee-fresh-tier-b");
  });

  it("returns null for an empty or absent progression map", () => {
    expect(pickCurrentRaid({})).toBeNull();
    expect(pickCurrentRaid(null)).toBeNull();
    expect(pickCurrentRaid(undefined)).toBeNull();
  });
});

describe("raidDisplayName", () => {
  it("title-cases and strips tier-/raid- prefixes", () => {
    expect(raidDisplayName("qqq-newest-citadel")).toBe("Qqq Newest Citadel");
    expect(raidDisplayName("tier-amirdrassil")).toBe("Amirdrassil");
    expect(raidDisplayName("raid-nerubar-palace")).toBe("Nerubar Palace");
  });
});
