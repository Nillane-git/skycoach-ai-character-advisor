// Raw Raider.IO API response shape (https://raider.io/api/v1/characters/profile).
// These interfaces mirror the API verbatim (snake_case). Normalization into the
// app's canonical NormalizedCharacter happens elsewhere (normalize-input.ts).

export interface RaiderIoGear {
  item_level_equipped: number;
  item_level_total: number;
}

export interface RaiderIoSeasonScores {
  all: number;
  dps: number;
  healer: number;
  tank: number;
}

export interface RaiderIoSeasonScore {
  season: string;
  scores: RaiderIoSeasonScores;
}

export interface RaiderIoBestRun {
  dungeon: string;
  short_name: string;
  mythic_level: number;
  num_keystone_upgrades: number;
  score: number;
}

export interface RaiderIoRaidProgressionEntry {
  summary: string;
  expansion_id: number;
  total_bosses: number;
  normal_bosses_killed: number;
  heroic_bosses_killed: number;
  mythic_bosses_killed: number;
}

export interface RaiderIoProfile {
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  active_spec_role: string;
  faction: string;
  region: string;
  realm: string;
  thumbnail_url: string;
  profile_url: string;
  gear?: RaiderIoGear;
  mythic_plus_scores_by_season?: RaiderIoSeasonScore[];
  mythic_plus_best_runs?: RaiderIoBestRun[];
  raid_progression?: Record<string, RaiderIoRaidProgressionEntry>;
}
