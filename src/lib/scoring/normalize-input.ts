import type {
  NormalizedCharacter,
  Region,
  Role,
  BestRun,
  CurrentRaid,
} from "@/types/character";
import type { RaiderIoProfile } from "@/lib/raiderio/types";
import { SCORING } from "@/config/scoring";
import { pickCurrentRaid, raidDisplayName } from "./raid-selector";

/** Map raider.io's "Dps"/"Healer"/"Tank" to the canonical upper-case Role. */
function normalizeRole(activeSpecRole: string | undefined): Role {
  switch ((activeSpecRole ?? "").toLowerCase()) {
    case "healer":
      return "HEALER";
    case "tank":
      return "TANK";
    default:
      return "DPS";
  }
}

/**
 * Map a normalized role to the matching key in raider.io's per-role M+ scores
 * (`dps`/`healer`/`tank`).
 */
function roleScoreKey(role: Role): "dps" | "healer" | "tank" {
  switch (role) {
    case "HEALER":
      return "healer";
    case "TANK":
      return "tank";
    default:
      return "dps";
  }
}

/**
 * Transform a raw raider.io profile into the canonical NormalizedCharacter.
 * Pure: no IO, no clock, no randomness. All season ceilings come from SCORING.
 */
export function normalizeCharacter(
  raw: RaiderIoProfile,
  region: Region,
): NormalizedCharacter {
  const role = normalizeRole(raw.active_spec_role);

  // --- Item level -----------------------------------------------------------
  const equipped = raw.gear?.item_level_equipped ?? 0;
  const total = raw.gear?.item_level_total ?? 0;

  // --- Mythic+ rating -------------------------------------------------------
  const seasonScores = raw.mythic_plus_scores_by_season?.[0]?.scores;
  const ratingAll = seasonScores?.all ?? 0;
  const byRoleRaw = seasonScores?.[roleScoreKey(role)];
  const ratingByRole =
    typeof byRoleRaw === "number" && byRoleRaw > 0 ? byRoleRaw : ratingAll;

  // --- Best runs ------------------------------------------------------------
  const bestRuns: BestRun[] = (raw.mythic_plus_best_runs ?? []).map((run) => ({
    dungeon: run.dungeon ?? "",
    shortName: run.short_name ?? "",
    level: run.mythic_level ?? 0,
    upgrades: run.num_keystone_upgrades ?? 0,
    score: run.score ?? 0,
  }));

  // Distinct dungeons cleared at/above the keystone floor (by short_name).
  const { keystoneFloor } = SCORING.dungeons;
  const distinctSet = new Set<string>();
  for (const run of bestRuns) {
    if (run.level >= keystoneFloor && run.shortName) {
      distinctSet.add(run.shortName);
    }
  }
  const distinctDungeonsAtOrAbove10 = distinctSet.size;

  // --- Current raid ---------------------------------------------------------
  const picked = pickCurrentRaid(raw.raid_progression);
  let currentRaid: CurrentRaid | null = null;
  if (picked) {
    const e = picked.entry;
    currentRaid = {
      slug: picked.slug,
      name: raidDisplayName(picked.slug),
      totalBosses: e.total_bosses ?? 0,
      normalKilled: e.normal_bosses_killed ?? 0,
      heroicKilled: e.heroic_bosses_killed ?? 0,
      mythicKilled: e.mythic_bosses_killed ?? 0,
      summary: e.summary ?? "",
    };
  }

  // --- Flags ----------------------------------------------------------------
  const hasMythicPlus = ratingAll > 0 || ratingByRole > 0;
  const hasRaid =
    currentRaid !== null &&
    (currentRaid.normalKilled > 0 ||
      currentRaid.heroicKilled > 0 ||
      currentRaid.mythicKilled > 0);
  const isEmpty = equipped <= 0 && !hasMythicPlus && currentRaid === null;

  return {
    identity: {
      name: raw.name ?? "",
      realm: raw.realm ?? "",
      region,
      race: raw.race ?? "",
      className: raw.class ?? "",
      spec: raw.active_spec_name ?? "",
      role,
      faction: raw.faction ?? "",
      thumbnailUrl: raw.thumbnail_url ?? null,
      profileUrl: raw.profile_url ?? null,
    },
    itemLevel: { equipped, total },
    mythicPlus: {
      ratingAll,
      ratingByRole,
      bestRuns,
      distinctDungeonsAtOrAbove10,
    },
    currentRaid,
    flags: { hasMythicPlus, hasRaid, isEmpty },
  };
}
