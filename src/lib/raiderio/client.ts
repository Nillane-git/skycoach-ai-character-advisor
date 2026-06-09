import { AppError } from "@/lib/errors";
import type { Region } from "@/types/character";
import type { RaiderIoProfile } from "./types";
import { mapRaiderIoError } from "./errors";
import { realmSlug, normalizeName } from "./slug";

const RAIDERIO_PROFILE_URL = "https://raider.io/api/v1/characters/profile";
const FIELDS =
  "gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs,raid_progression";
const REQUEST_TIMEOUT_MS = 10_000;

export interface FetchCharacterParams {
  region: Region | string;
  realm: string;
  name: string;
}

export async function fetchCharacter({
  region,
  realm,
  name,
}: FetchCharacterParams): Promise<RaiderIoProfile> {
  const params = new URLSearchParams({
    region,
    realm: realmSlug(realm),
    name: normalizeName(name),
    fields: FIELDS,
  });
  const url = `${RAIDERIO_PROFILE_URL}?${params.toString()}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent": "SkyCoach-AI/1.0",
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    // network failure, DNS, or 10s abort/timeout
    throw new AppError(
      "RAIDERIO_UNAVAILABLE",
      "Raider.IO сейчас недоступен. Попробуйте ещё раз.",
      503,
    );
  }

  if (!res.ok) {
    // 5xx is an upstream outage rather than a business error.
    if (res.status >= 500) {
      throw new AppError(
        "RAIDERIO_UNAVAILABLE",
        "Raider.IO сейчас недоступен. Попробуйте ещё раз.",
        503,
      );
    }
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw mapRaiderIoError(res.status, body);
  }

  let data: RaiderIoProfile;
  try {
    data = (await res.json()) as RaiderIoProfile;
  } catch {
    throw new AppError(
      "EMPTY_OR_MALFORMED",
      "Raider.IO вернул нечитаемый ответ.",
      502,
    );
  }

  if (!data || !data.name || !data.class) {
    throw new AppError(
      "EMPTY_OR_MALFORMED",
      "Raider.IO returned an incomplete character profile.",
      502,
    );
  }

  return data;
}
