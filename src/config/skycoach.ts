export const SKYCOACH_CARDS = [
  {
    title: "Progress Faster",
    description:
      "Reduce the time required to reach your next progression milestone.",
    cta: "Explore Options",
    href: "#",
  },
  {
    title: "Get Expert Guidance",
    description:
      "Work with experienced players to improve gameplay and decision making.",
    cta: "Learn More",
    href: "#",
  },
  {
    title: "Accelerate Character Growth",
    description: "Save time and focus on the content you enjoy most.",
    cta: "View Services",
    href: "#",
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
