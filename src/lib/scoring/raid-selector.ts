/**
 * Minimal shape of a single raider.io `raid_progression` entry that the
 * selector cares about. Extra fields on the real payload are ignored.
 */
export interface RaidProgressionEntry {
  summary?: string;
  expansion_id?: number;
  total_bosses?: number;
  normal_bosses_killed?: number;
  heroic_bosses_killed?: number;
  mythic_bosses_killed?: number;
}

/**
 * Choose the character's "current" raid from raider.io's `raid_progression`
 * map. raider.io lists raids oldest -> newest.
 *
 * Algorithm (NEVER hardcodes a raid slug):
 *  1. Find the maximum `expansion_id` present.
 *  2. Among entries in that expansion, prefer ones with any kills; return the
 *     LAST such key (the newest tier the character has touched).
 *  3. If none in that expansion have kills, return the LAST entry of the
 *     max-expansion group (the newest available tier).
 *  4. Return null only when the map is empty/absent.
 */
export function pickCurrentRaid(
  raidProgression: Record<string, RaidProgressionEntry> | null | undefined,
): { slug: string; entry: RaidProgressionEntry } | null {
  if (!raidProgression) return null;

  const keys = Object.keys(raidProgression);
  if (keys.length === 0) return null;

  // Maximum expansion_id across all entries (missing -> -Infinity so real
  // expansions always win, but a map of only-missing still resolves).
  let maxExpansion = -Infinity;
  for (const key of keys) {
    const exp = raidProgression[key]?.expansion_id;
    if (typeof exp === "number" && exp > maxExpansion) maxExpansion = exp;
  }

  const inMaxGroup = (key: string): boolean => {
    const exp = raidProgression[key]?.expansion_id;
    if (maxExpansion === -Infinity) return true; // no expansion ids at all
    return exp === maxExpansion;
  };

  const hasKills = (entry: RaidProgressionEntry): boolean =>
    (entry.normal_bosses_killed ?? 0) > 0 ||
    (entry.heroic_bosses_killed ?? 0) > 0 ||
    (entry.mythic_bosses_killed ?? 0) > 0;

  // Walk oldest -> newest; remember the last key in the max group, and the
  // last key in the max group that has kills.
  let lastInGroup: string | null = null;
  let lastWithKills: string | null = null;

  for (const key of keys) {
    if (!inMaxGroup(key)) continue;
    lastInGroup = key;
    if (hasKills(raidProgression[key])) lastWithKills = key;
  }

  const chosen = lastWithKills ?? lastInGroup;
  if (!chosen) return null;

  return { slug: chosen, entry: raidProgression[chosen] };
}

/**
 * Derive a human display name from a raid slug: strip a leading `tier-` or
 * `raid-` prefix, replace dashes/underscores with spaces, and Title Case.
 *
 * e.g. "nerubar-palace" -> "Nerubar Palace",
 *      "tier-amirdrassil" -> "Amirdrassil".
 */
export function raidDisplayName(slug: string): string {
  const stripped = slug.replace(/^(tier-|raid-)/i, "");
  const words = stripped.replace(/[-_]+/g, " ").trim().split(/\s+/);
  return words
    .filter((w) => w.length > 0)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}
