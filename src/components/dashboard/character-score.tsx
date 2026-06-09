import { ScoreDial } from "@/components/score-dial";
import { rarityColor } from "@/config/rarity";

interface Band {
  label: string;
  min: number;
  blurb: string;
}

const BANDS: Band[] = [
  { label: "Элита", min: 85, blurb: "Среди самых прокачанных персонажей." },
  { label: "Сильный", min: 65, blurb: "Сбалансирован, готов к рейду и ключам." },
  { label: "Развивается", min: 40, blurb: "Хорошая база с понятными шагами." },
  { label: "Начало", min: 0, blurb: "База формируется — продолжай в том же духе." },
];

function bandFor(score: number): Band {
  return BANDS.find((b) => score >= b.min) ?? BANDS[BANDS.length - 1];
}

/**
 * Headline character score, rendered as a large rarity-tinted medallion.
 * The arc + big number glow in the score's rarity color (gold at 85+),
 * which reads as an achievement/rank rather than a plain progress ring.
 */
export function CharacterScore({ score }: { score: number }) {
  const band = bandFor(score);
  const tierColor = rarityColor(score);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <ScoreDial
        value={score}
        accent={tierColor}
        glow={tierColor}
        size={216}
        display
        data-testid="character-score-value"
      />
      <div>
        <p
          className="font-[family-name:var(--font-display)] text-2xl font-extrabold uppercase tracking-[0.18em]"
          style={{ color: tierColor }}
        >
          {band.label}
        </p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Общая оценка персонажа
        </p>
        <p className="mx-auto mt-3 max-w-[260px] text-sm leading-relaxed text-white/60">
          {band.blurb}
        </p>
      </div>
    </div>
  );
}
