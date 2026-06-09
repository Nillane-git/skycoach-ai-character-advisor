export const SKYCOACH_CARDS = [
  {
    title: "Прогрессируй быстрее",
    description:
      "Сократи время до следующего рубежа прогресса своего персонажа.",
    cta: "Смотреть варианты",
    href: "https://skycoach.gg/wow-boost",
  },
  {
    title: "Экспертное сопровождение",
    description:
      "Играй с опытными игроками, чтобы прокачать геймплей и принятие решений.",
    cta: "Подробнее",
    href: "https://skycoach.gg/wow-boost",
  },
  {
    title: "Ускорь рост персонажа",
    description: "Экономь время и фокусируйся на контенте, который нравится.",
    cta: "Услуги",
    href: "https://skycoach.gg/wow-boost",
  },
] as const;

export type SkycoachCard = (typeof SKYCOACH_CARDS)[number];

/**
 * The deterministic metric keys the analyzer can flag as a character's
 * weakest area. Used to choose which fixed SkyCoach card to lead with.
 */
export type WeakestMetricKey = "itemLevel" | "mythicPlus" | "raid" | "dungeons";

/**
 * Optional helper: maps the character's weakest metric to the index of the
 * most relevant fixed SkyCoach card. Titles and CTAs always stay fixed —
 * this only influences which card to surface/emphasize first.
 *
 *  - itemLevel / raid -> "Progress Faster" (gear & boss progression)
 *  - mythicPlus       -> "Get Expert Guidance" (gameplay & decision making)
 *  - dungeons         -> "Accelerate Character Growth" (coverage / time saved)
 */
export function pickSuggestionFocus(
  weakestMetricKey: WeakestMetricKey,
): SkycoachCard {
  const indexByKey: Record<WeakestMetricKey, number> = {
    itemLevel: 0,
    raid: 0,
    mythicPlus: 1,
    dungeons: 2,
  };
  return SKYCOACH_CARDS[indexByKey[weakestMetricKey]];
}
