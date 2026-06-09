import type { NormalizedCharacter, Role } from "@/types/character";
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

// Russian role label used inside generated prose.
const ROLE_RU: Record<Role, string> = {
  DPS: "ДД",
  HEALER: "хилер",
  TANK: "танк",
};
const roleRu = (role: Role) => ROLE_RU[role] ?? "игрок";

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
    itemLevel: { key: "itemLevel", label: "Уровень предметов", norm: ilvlNorm },
    mythicPlus: { key: "mythicPlus", label: "Mythic+", norm: mplusNorm },
    raid: { key: "raid", label: "Рейд", norm: raidNorm },
    dungeons: {
      key: "dungeons",
      label: "Охват подземелий",
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
      `Прочная база экипировки — ${c.itemLevel.equipped} ilvl надетого.`,
    );
  }
  if (m.mythicPlus.norm >= 70) {
    out.push(
      `Конкурентный рейтинг Mythic+ (${c.mythicPlus.ratingByRole}) для твоей роли.`,
    );
  }
  if (c.currentRaid) {
    const heroicProgress =
      c.currentRaid.totalBosses > 0
        ? (c.currentRaid.heroicKilled / c.currentRaid.totalBosses) * 100
        : 0;
    if (heroicProgress >= 75) {
      out.push(
        `Хороший прогресс героика (${c.currentRaid.summary}) в «${c.currentRaid.name}».`,
      );
    }
  }
  if (m.dungeons.norm >= 75) {
    out.push(
      `Широкий охват подземелий: ${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize} на +${SCORING.dungeons.keystoneFloor} и выше.`,
    );
  }

  // Always-available, distinct notes so even a developing character surfaces
  // at least three meaningful strengths to build around.
  const ordered = weakestFirst(m);
  const strongest = ordered[ordered.length - 1];
  out.push(
    `${strongest.label} — твоя сильнейшая зона и лучшая база для набора темпа.`,
  );
  out.push(
    `Чёткая роль (${roleRu(c.identity.role)}) — есть вокруг чего выстраивать апгрейды.`,
  );
  out.push(
    "Хорошая стартовая база, чтобы конвертировать в рейтинг и экипировку при фокусной игре.",
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
    itemLevel: `Уровень предметов (${c.itemLevel.equipped}) ниже планки для актуального контента.`,
    mythicPlus: `Рейтинг Mythic+ (${c.mythicPlus.ratingByRole}) отстаёт от сезонной цели.`,
    raid:
      c.currentRaid && c.currentRaid.summary
        ? `Прогресс рейда (${c.currentRaid.summary}) пока в самом начале сезона.`
        : "Прогресс рейда в этом сезоне ещё не начат.",
    dungeons: `Малый охват подземелий (${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize}) — рейтинг недобирается.`,
  };
  const roomText: Record<MetricKey, string> = {
    itemLevel: `У уровня предметов (${c.itemLevel.equipped}) ещё есть апгрейды до потолка ${SCORING.itemLevel.cap}.`,
    mythicPlus: `Рейтинг Mythic+ (${c.mythicPlus.ratingByRole}) ещё может расти к потолку ${SCORING.mythicPlus.cap}.`,
    raid:
      c.currentRaid && c.currentRaid.summary
        ? `В прогрессе рейда (${c.currentRaid.summary}) остались боссы на более высокой сложности.`
        : "Прогресс рейда в этом сезоне ещё не начат.",
    dungeons: `Охват подземелий (${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize}) ещё не полный на +${SCORING.dungeons.keystoneFloor}.`,
  };

  // A metric is a "weakness" if it is not maxed: hard language when low,
  // softer "room to grow" language in the mid band; skip when already at 100.
  for (const metric of ordered) {
    if (metric.norm < 50) out.push(lowText[metric.key]);
    else if (metric.norm < 100) out.push(roomText[metric.key]);
  }

  if (!c.currentRaid) {
    out.push("Убийств боссов в мифик-рейде в этом сезоне пока нет.");
  } else if (c.currentRaid.mythicKilled < c.currentRaid.totalBosses) {
    out.push(
      `Мифик-рейд ещё не закрыт (${c.currentRaid.mythicKilled}/${c.currentRaid.totalBosses} М).`,
    );
  }

  // Always-available growth notes guarantee at least three distinct items even
  // for a near-best-in-slot character whose metrics are all maxed.
  out.push(
    `Как ${roleRu(c.identity.role)}, следующий рост — стабильность под давлением, когда цифры уже на пике.`,
  );
  out.push(
    "Выход в title-рейндж Mythic+ и полные мифик-килы — вот что отделяет от общей массы.",
  );
  out.push(
    "Держать пиковую экипировку, рейтинг и килы из недели в неделю — вот настоящий вызов дальше.",
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
    itemLevel: `Экипировка на ${c.itemLevel.equipped} ilvl ограничивает сложность, которую стабильно закрываешь, — упираются и ключи Mythic+, и боссы рейда.`,
    mythicPlus: `Рейтинг Mythic+ (${c.mythicPlus.ratingByRole}) ограничивает уровень ключей, который тянешь, тормозя и рейтинг, и добычу экипировки.`,
    raid: c.currentRaid
      ? `Прогресс рейда (${c.currentRaid.summary}) отстаёт, поэтому боссы на высокой сложности и их лут пока недоступны.`
      : `Без активного прогресса рейда не задействован целый источник апгрейдов и рейтинга.`,
    dungeons: `Лишь ${c.mythicPlus.distinctDungeonsAtOrAbove10}/${SCORING.dungeons.poolSize} подземелий пройдено на +${SCORING.dungeons.keystoneFloor} — лёгкий рейтинг и недельные награды не получены.`,
  };

  const titleByKey: Record<MetricKey, string> = {
    itemLevel: "Экипировка ниже планки контента",
    mythicPlus: "Плато рейтинга Mythic+",
    raid: "Застопорившийся прогресс рейда",
    dungeons: "Неполный охват подземелий",
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
    itemLevel: `Подними уровень предметов выше ${c.itemLevel.equipped}, фармя самый сложный контент, который стабильно закрываешь.`,
    mythicPlus: `Тайми ключи Mythic+ выше текущего рейтинга ${c.mythicPlus.ratingByRole}, чтобы лезть вверх по кривой рейтинга.`,
    raid: c.currentRaid
      ? `Преврати ${c.currentRaid.summary} в килы на следующей сложности рейда «${c.currentRaid.name}».`
      : "Начни рейд текущего сезона — это новый источник экипировки и рейтинга.",
    dungeons: `Пройди ещё ${Math.max(
      0,
      SCORING.dungeons.poolSize - c.mythicPlus.distinctDungeonsAtOrAbove10,
    )} подземелий на +${SCORING.dungeons.keystoneFloor} для полного охвата ${SCORING.dungeons.poolSize}/${SCORING.dungeons.poolSize}.`,
  };

  const out = ordered.map((metric) => stepByKey[metric.key]);

  // Stable closing steps to guarantee the 4-6 floor with concrete actions.
  out.push(
    "Закрывай недельный сейф Mythic+, прогоняя ключи по разным подземельям.",
  );
  out.push(
    "Перезапусти этот анализ после следующего скачка экипировки или рейтинга, чтобы пересобрать приоритеты.",
  );

  return out;
}

function buildRoadmap(
  c: NormalizedCharacter,
  m: Record<MetricKey, MetricView>,
): RoadmapStep[] {
  const ordered = weakestFirst(m);
  const phases = ["На этой неделе", "Ближайшие 2 недели", "В этом сезоне"];

  const detailByKey: Record<MetricKey, string> = {
    itemLevel: `Направляй каждый апгрейд на рост уровня предметов с ${c.itemLevel.equipped}.`,
    mythicPlus: `Тайми ключи выше рейтинга ${c.mythicPlus.ratingByRole}, копя рейтинг и экипировку.`,
    raid: c.currentRaid
      ? `Продвинь прогресс «${c.currentRaid.name}» дальше ${c.currentRaid.summary}.`
      : "Начни рейд текущего сезона ради свежих апгрейдов.",
    dungeons: `Добери охват подземелий до ${SCORING.dungeons.poolSize}/${SCORING.dungeons.poolSize} на +${SCORING.dungeons.keystoneFloor}.`,
  };

  const titleByKey: Record<MetricKey, string> = {
    itemLevel: "Поднять уровень предметов",
    mythicPlus: "Поднять рейтинг Mythic+",
    raid: "Продвинуть прогресс рейда",
    dungeons: "Закрыть охват подземелий",
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
      "Быстрее доберись до следующего рубежа по уровню предметов с точечными фармами.",
      "Получи экспертный разбор, какой контент даёт нужную тебе экипировку.",
      "Ускорь прокачку экипировки — меньше гринда, больше прогресса.",
    ],
    mythicPlus: [
      "Прогрессируй быстрее, пушая высокие ключи в слаженной группе.",
      "Экспертный разбор маршрутов, пуллов и решений по уровню ключа.",
      "Ускорь рост рейтинга Mythic+ и верни свой недельный сейф.",
    ],
    raid: [
      "Быстрее дойди до следующего рубежа сложности рейда.",
      "Экспертный разбор тактик боссов и решений в рейде.",
      "Ускорь прогресс рейда — лут сезона откроется раньше.",
    ],
    dungeons: [
      "Прогрессируй быстрее, закрыв оставшийся охват подземелий.",
      "Экспертный разбор, какие подземелья эффективнее для полного охвата.",
      "Ускорь полный охват подземелий и рейтинг, который он открывает.",
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
