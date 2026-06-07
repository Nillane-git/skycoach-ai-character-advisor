import type {
  NormalizedCharacter,
  CurrentRaid,
  BestRun,
  Role,
  Region,
} from "@/types/character";

/**
 * Small in-test factory for NormalizedCharacter objects. Defaults describe a
 * mid-tier character; pass a partial to override any branch. Building these by
 * hand (instead of importing JSON) keeps unit tests deterministic and focused
 * on the scoring math rather than the raider.io normalization layer.
 */
export function makeCharacter(
  overrides: DeepPartial<NormalizedCharacter> = {},
): NormalizedCharacter {
  const base: NormalizedCharacter = {
    identity: {
      name: "Testchar",
      realm: "Demo",
      region: "us" as Region,
      race: "Void Elf",
      className: "Mage",
      spec: "Frost",
      role: "DPS" as Role,
      faction: "alliance",
      thumbnailUrl: null,
      profileUrl: null,
    },
    itemLevel: { equipped: 609.5, total: 612 },
    mythicPlus: {
      ratingAll: 1500,
      ratingByRole: 1500,
      bestRuns: [],
      distinctDungeonsAtOrAbove10: 4,
    },
    currentRaid: makeRaid({
      heroicKilled: 8,
    }),
    flags: { hasMythicPlus: true, hasRaid: true, isEmpty: false },
  };

  return mergeCharacter(base, overrides);
}

export function makeRaid(overrides: Partial<CurrentRaid> = {}): CurrentRaid {
  return {
    slug: "nerubar-palace",
    name: "Nerubar Palace",
    totalBosses: 8,
    normalKilled: 0,
    heroicKilled: 0,
    mythicKilled: 0,
    summary: "",
    ...overrides,
  };
}

export function makeRun(overrides: Partial<BestRun> = {}): BestRun {
  return {
    dungeon: "Ara-Kara, City of Echoes",
    shortName: "ARAK",
    level: 12,
    upgrades: 2,
    score: 220,
    ...overrides,
  };
}

/** A fully zeroed-out character (no gear, no rating, no raid). */
export function makeZeroCharacter(): NormalizedCharacter {
  return makeCharacter({
    itemLevel: { equipped: 0, total: 0 },
    mythicPlus: {
      ratingAll: 0,
      ratingByRole: 0,
      bestRuns: [],
      distinctDungeonsAtOrAbove10: 0,
    },
    currentRaid: null,
    flags: { hasMythicPlus: false, hasRaid: false, isEmpty: true },
  });
}

/** A maxed "full BiS mythic raider" — every sub-metric pinned at its cap. */
export function makeMaxCharacter(): NormalizedCharacter {
  return makeCharacter({
    itemLevel: { equipped: 639, total: 639 },
    mythicPlus: {
      ratingAll: 3000,
      ratingByRole: 3000,
      bestRuns: [],
      distinctDungeonsAtOrAbove10: 8,
    },
    currentRaid: makeRaid({
      normalKilled: 8,
      heroicKilled: 8,
      mythicKilled: 8,
      summary: "8/8 M",
    }),
    flags: { hasMythicPlus: true, hasRaid: true, isEmpty: false },
  });
}

// --- tiny deep-merge limited to the NormalizedCharacter shape ---

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object | null
    ? T[K] extends null
      ? T[K]
      : DeepPartial<NonNullable<T[K]>> | null
    : T[K];
};

function mergeCharacter(
  base: NormalizedCharacter,
  o: DeepPartial<NormalizedCharacter>,
): NormalizedCharacter {
  return {
    identity: { ...base.identity, ...(o.identity ?? {}) },
    itemLevel: { ...base.itemLevel, ...(o.itemLevel ?? {}) },
    mythicPlus: { ...base.mythicPlus, ...(o.mythicPlus ?? {}) },
    currentRaid:
      o.currentRaid === undefined
        ? base.currentRaid
        : o.currentRaid === null
          ? null
          : { ...(base.currentRaid ?? makeRaid()), ...o.currentRaid },
    flags: { ...base.flags, ...(o.flags ?? {}) },
  } as NormalizedCharacter;
}
