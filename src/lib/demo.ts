import type { RaiderIoProfile } from "@/lib/raiderio/types";

import demoCharacterFixture from "../../fixtures/raiderio/demo-character.json";
import noMplusFixture from "../../fixtures/raiderio/no-mplus.json";
import healerFixture from "../../fixtures/raiderio/healer.json";
import freshFixture from "../../fixtures/raiderio/fresh.json";

export const DEMO = { region: "us", realm: "demo", name: "skycoach" } as const;

export type FixtureName = "demo-character" | "no-mplus" | "healer" | "fresh";

const FIXTURES: Record<FixtureName, unknown> = {
  "demo-character": demoCharacterFixture,
  "no-mplus": noMplusFixture,
  healer: healerFixture,
  fresh: freshFixture,
};

export function isDemoCharacter(region: string, realm: string, name: string): boolean {
  return (
    region.toLowerCase() === DEMO.region &&
    realm.toLowerCase() === DEMO.realm &&
    name.toLowerCase() === DEMO.name
  );
}

export function loadFixture(which: FixtureName = "demo-character"): RaiderIoProfile {
  return FIXTURES[which] as RaiderIoProfile;
}
