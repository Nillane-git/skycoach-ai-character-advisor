import { ScoreDial } from "@/components/score-dial";

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

export function CharacterScore({ score }: { score: number }) {
  const band = bandFor(score);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <ScoreDial value={score} label={band.label} size={168} />
      <div className="text-center sm:text-left">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">
          Общая оценка персонажа
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
          <span data-testid="character-score-value">{score}</span>
          <span className="text-base font-normal text-white/40"> / 100</span>
        </p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
          {band.blurb}
        </p>
      </div>
    </div>
  );
}
