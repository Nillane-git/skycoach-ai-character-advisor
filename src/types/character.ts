export type Role = "DPS" | "HEALER" | "TANK";
export type Region = "us" | "eu" | "kr" | "tw";

export interface BestRun {
  dungeon: string;
  shortName: string;
  level: number;
  upgrades: number;
  score: number;
}

export interface CurrentRaid {
  slug: string;
  name: string;
  totalBosses: number;
  normalKilled: number;
  heroicKilled: number;
  mythicKilled: number;
  summary: string;
}

export interface NormalizedCharacter {
  identity: {
    name: string;
    realm: string;
    region: Region;
    race: string;
    className: string;
    spec: string;
    role: Role;
    faction: string;
    thumbnailUrl: string | null;
    profileUrl: string | null;
  };
  itemLevel: { equipped: number; total: number };
  mythicPlus: {
    ratingAll: number;
    ratingByRole: number;
    bestRuns: BestRun[];
    distinctDungeonsAtOrAbove10: number;
  };
  currentRaid: CurrentRaid | null;
  flags: { hasMythicPlus: boolean; hasRaid: boolean; isEmpty: boolean };
}
