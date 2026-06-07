import type { NormalizedCharacter } from "@/types/character";
import type {
  Analysis,
  Bottleneck,
  RoadmapStep,
  Suggestion,
} from "@/types/analysis";
import {
  normItemLevel,
  normMythicPlus,
  normRaid,
  normDungeonCoverage,
} from "@/lib/scoring/normalize";
import { SCORING } from "@/config/scoring";
import {
  SKYCOACH_CARDS,
  type WeakestMetricKey,
} from "@/config/skycoach";
import type { AnalysisNumbers } from "@/lib/analyze/prompt";

type MetricKey = WeakestMetricKey;

interface MetricView {
  key: MetricKey;
  label: string;
  norm: number;
}

function buildMetrics(c: NormalizedCharacter): Record<MetricKey, MetricView> {
  const raid = c.currentRaid;
  const ilvlNorm = normItemLevel(c.itemLevel.equipped);
  const mplusNorm = normMythicPlus(c.mythicPlus.ratingByRole);
  const raidNorm = raid
    ? normRaid(
        raid.normalKilled,
        raid.heroicKilled,
        raid.mythicKilled,
        raid.totalBosses,
      )
    : 0;
  const coverageNorm = normDungeonCoverage(
    c.mythicPlus.distinctDungeonsAtOrAbove10,
  );

  return {
    itemLevel: { key: "itemLevel", label: "Item Level", norm: ilvlNorm },
    mythicPlus: { key: "mythicPlus", label: "Mythic+", norm: mplusNorm },
    raid: { key: "raid", label: "Raid Progression", norm: raidNorm },
    dungeons: {
      key: "dungeons",
      label: "Dungeon Coverage",
      norm: coverageNorm,
    },
  };
}

/**
 * Order metrics weakest-first. Deterministic and stable: ties break on a fixed
 * priority order so the same input always yields the same ordering.
 */
const METRIC_PRIORITY: MetricKey[] = [
  "itemLevel",
  "mythicPlus",
  "raid",
  "dungeons",
];

function weakestFirst(
  metrics: Record<MetricKey, MetricView>,
): MetricView[] {
  return METRIC_PRIORITY.map((k) => metrics[k]).sort((a, b) => {
    if (a.norm !== b.norm) return a.norm - b.norm;
    return METRIC_PRIORITY.indexOf(a.key) - METRIC_PRIORITY.indexOf(b.key);
  });
}

function buildStrengths(
  c: NormalizedCharacter,
  m: Record<MetricKey, MetricView>,
): string[] {
  const out: string[] = [];

  if (m.itemLevel.norm >= 80) {
    out.push(
      `Strong gear foundation at ${c.itemLevel.equipped} equipped item level.`,
    );
  }
  if (m.mythicPlus.norm >= 70) {
    out.push(
      `Competitive Mythic+ rating of ${c.mythicPlus.ratingByRole} for your role.`,
    );
  }
  if (c.currentRaid) {
    const heroicProgress =
      c.currentRaid.totalBosses > 0
        ? (c.currentRaid.heroicKilled / c.currentRaid.totalBosses) * 100
        : 0;
    if (heroicProgress >= 75) {
      out.push(
        `Deep Heroic raid progress (${c.currentRaid.summary}) in ${c.currentRaid.name}.`,
      );
    }
  }
  if (m.dungeons.norm >= 75) {
    out.push(
      `Broad dungeon coverage with ${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize} dungeons at +${SCORING.dungeons.keystoneFloor} or higher.`,
    );
  }

  // Always-available, distinct notes so even a developing character surfaces
  // at least three meaningful strengths to build around.
  const ordered = weakestFirst(m);
  const strongest = ordered[ordered.length - 1];
  out.push(
    `${strongest.label} is your strongest area and the best base to build momentum from.`,
  );
  out.push(
    `Clear ${c.identity.role} role identity to focus every upgrade decision.`,
  );
  out.push(
    "A solid baseline to convert into rating and gear with focused weekly play.",
  );

  // De-duplicate while preserving order (relevant items come first).
  return Array.from(new Set(out));
}

function buildWeaknesses(
  c: NormalizedCharacter,
  m: Record<MetricKey, MetricView>,
): string[] {
  const out: string[] = [];
  const ordered = weakestFirst(m); // weakest metric first

  const lowText: Record<MetricKey, string> = {
    itemLevel: `Item level (${c.itemLevel.equipped}) is below the band needed for current content.`,
    mythicPlus: `Mythic+ rating (${c.mythicPlus.ratingByRole}) trails the season target.`,
    raid:
      c.currentRaid && c.currentRaid.summary
        ? `Raid progression (${c.currentRaid.summary}) is still early this tier.`
        : "Raid progression has yet to begin this tier.",
    dungeons: `Limited dungeon coverage (${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize}) leaves rating on the table.`,
  };
  const roomText: Record<MetricKey, string> = {
    itemLevel: `Item level (${c.itemLevel.equipped}) still has upgrades left toward the ${SCORING.itemLevel.cap} ceiling.`,
    mythicPlus: `Mythic+ rating (${c.mythicPlus.ratingByRole}) has room to climb toward the ${SCORING.mythicPlus.cap} ceiling.`,
    raid:
      c.currentRaid && c.currentRaid.summary
        ? `Raid progression (${c.currentRaid.summary}) still has bosses left on higher difficulty.`
        : "Raid progression has yet to begin this tier.",
    dungeons: `Dungeon coverage (${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize}) is not yet complete at +${SCORING.dungeons.keystoneFloor}.`,
  };

  // A metric is a "weakness" if it is not maxed: hard language when low,
  // softer "room to grow" language in the mid band; skip when already at 100.
  for (const metric of ordered) {
    if (metric.norm < 50) out.push(lowText[metric.key]);
    else if (metric.norm < 100) out.push(roomText[metric.key]);
  }

  if (!c.currentRaid) {
    out.push("No Mythic raid kills yet this tier.");
  } else if (c.currentRaid.mythicKilled < c.currentRaid.totalBosses) {
    out.push(
      `Mythic raid is not yet cleared (${c.currentRaid.mythicKilled}/${c.currentRaid.totalBosses} M).`,
    );
  }

  // Always-available growth notes guarantee at least three distinct items even
  // for a near-best-in-slot character whose metrics are all maxed.
  out.push(
    `As a ${c.identity.role}, consistency under pressure is the next gain once the numbers peak.`,
  );
  out.push(
    "Pushing into title-range Mythic+ and full Mythic clears is what now separates from the pack.",
  );
  out.push(
    "Holding peak gear, rating, and clears week over week is the real challenge from here.",
  );

  // De-duplicate while preserving weakest-first order.
  return Array.from(new Set(out));
}

function buildBottlenecks(
  c: NormalizedCharacter,
  m: Record<MetricKey, MetricView>,
): Bottleneck[] {
  // The lowest normalized sub-metrics, each with a templated WHY.
  const ordered = weakestFirst(m);

  const explain: Record<MetricKey, string> = {
    itemLevel: `Gear at ${c.itemLevel.equipped} ilvl caps the difficulty you can reliably clear, gating both Mythic+ keys and raid bosses.`,
    mythicPlus: `A Mythic+ rating of ${c.mythicPlus.ratingByRole} limits the keystone level you can push, slowing both score and gear gains.`,
    raid: c.currentRaid
      ? `Raid progress (${c.currentRaid.summary}) lags, so higher-difficulty bosses and their gear remain out of reach.`
      : `No active raid progress means a full source of upgrades and score is untapped.`,
    dungeons: `Only ${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize} dungeons cleared at +${SCORING.dungeons.keystoneFloor} leaves easy rating and weekly rewards unclaimed.`,
  };

  const titleByKey: Record<MetricKey, string> = {
    itemLevel: "Gear Below Content Threshold",
    mythicPlus: "Mythic+ Rating Plateau",
    raid: "Stalled Raid Progression",
    dungeons: "Incomplete Dungeon Coverage",
  };

  return ordered.slice(0, 3).map((metric) => ({
    title: titleByKey[metric.key],
    explanation: explain[metric.key],
  }));
}

function buildActionPlan(
  c: NormalizedCharacter,
  m: Record<MetricKey, MetricView>,
): string[] {
  const ordered = weakestFirst(m);

  const stepByKey: Record<MetricKey, string> = {
    itemLevel: `Target gear upgrades to push past ${c.itemLevel.equipped} equipped item level via the highest-difficulty content you can clear.`,
    mythicPlus: `Push Mythic+ keys above your current rating of ${c.mythicPlus.ratingByRole} to climb the score curve.`,
    raid: c.currentRaid
      ? `Convert ${c.currentRaid.summary} into deeper kills on the next raid difficulty in ${c.currentRaid.name}.`
      : "Begin raiding the current tier to open a new source of gear and score.",
    dungeons: `Complete ${Math.max(
      0,
      SCORING.dungeons.poolSize - c.mythicPlus.distinctDungeonsAtOrAbove10,
    )} more +${SCORING.dungeons.keystoneFloor} dungeons for full ${SCORING.dungeons.poolSize}/${SCORING.dungeons.poolSize} coverage.`,
  };

  const out = ordered.map((metric) => stepByKey[metric.key]);

  // Stable closing steps to guarantee the 4-6 floor with concrete actions.
  out.push(
    `Maintain your weekly Mythic+ vault by running keys across multiple dungeons.`,
  );
  out.push(
    `Re-run this analysis after your next gear or rating jump to re-prioritize.`,
  );

  return out;
}

function buildRoadmap(
  c: NormalizedCharacter,
  m: Record<MetricKey, MetricView>,
): RoadmapStep[] {
  const ordered = weakestFirst(m);
  const phases = ["This week", "Next 2 weeks", "This tier"];

  const detailByKey: Record<MetricKey, string> = {
    itemLevel: `Funnel every upgrade toward raising equipped item level from ${c.itemLevel.equipped}.`,
    mythicPlus: `Time keys above your ${c.mythicPlus.ratingByRole} rating to bank score and gear.`,
    raid: c.currentRaid
      ? `Extend ${c.currentRaid.name} progress beyond ${c.currentRaid.summary}.`
      : "Start the current raid tier for fresh upgrades.",
    dungeons: `Fill out dungeon coverage toward ${SCORING.dungeons.poolSize}/${SCORING.dungeons.poolSize} at +${SCORING.dungeons.keystoneFloor}.`,
  };

  const titleByKey: Record<MetricKey, string> = {
    itemLevel: "Raise Item Level",
    mythicPlus: "Push Mythic+ Score",
    raid: "Advance Raid Progress",
    dungeons: "Complete Dungeon Coverage",
  };

  // Three phased steps from the three weakest metrics (stable order).
  return ordered.slice(0, 3).map((metric, i) => ({
    step: i + 1,
    title: `${phases[i]}: ${titleByKey[metric.key]}`,
    detail: detailByKey[metric.key],
  }));
}

function buildSuggestions(
  m: Record<MetricKey, MetricView>,
): Suggestion[] {
  const weakestKey = weakestFirst(m)[0].key;

  // Description tailored by which metric is weakest, while titles/CTAs stay
  // fixed (taken verbatim from the canonical cards).
  const descByWeakest: Record<MetricKey, [string, string, string]> = {
    itemLevel: [
      "Reach your next item-level milestone faster with targeted gear runs.",
      "Get expert guidance on which content yields the gear you still need.",
      "Accelerate gearing so you spend less time grinding and more time progressing.",
    ],
    mythicPlus: [
      "Progress faster by pushing higher keys with a coordinated group.",
      "Get expert guidance on routing, pulls, and key-level decision making.",
      "Accelerate your Mythic+ score growth and reclaim your weekly vault.",
    ],
    raid: [
      "Progress faster toward your next raid difficulty milestone.",
      "Get expert guidance on boss strategy and raid decision making.",
      "Accelerate raid progression so the tier's gear opens up sooner.",
    ],
    dungeons: [
      "Progress faster by closing out your remaining dungeon coverage.",
      "Get expert guidance on the most efficient dungeons to round out coverage.",
      "Accelerate full dungeon coverage and the rating it unlocks.",
    ],
  };

  const descriptions = descByWeakest[weakestKey];

  return SKYCOACH_CARDS.map((card, i) => ({
    title: card.title,
    description: descriptions[i] ?? card.description,
    cta: card.cta,
  }));
}

/**
 * PURE, deterministic analysis fallback. No randomness, no clock — the same
 * input always yields byte-identical output. Numbers come from the supplied
 * `numbers` (formula-derived); the qualitative text is threshold-driven.
 */
export function fallback(
  c: NormalizedCharacter,
  numbers: AnalysisNumbers,
): Analysis {
  const metrics = buildMetrics(c);

  return {
    characterScore: numbers.characterScore,
    readiness: numbers.readiness,
    strengths: buildStrengths(c, metrics),
    weaknesses: buildWeaknesses(c, metrics),
    bottlenecks: buildBottlenecks(c, metrics),
    actionPlan: buildActionPlan(c, metrics),
    roadmap: buildRoadmap(c, metrics),
    skycoachSuggestions: buildSuggestions(metrics),
  };
}
