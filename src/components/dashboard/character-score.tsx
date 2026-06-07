import { ScoreDial } from "@/components/score-dial";

interface Band {
  label: string;
  min: number;
  blurb: string;
}

const BANDS: Band[] = [
  { label: "Elite", min: 85, blurb: "Among the most progressed characters." },
  { label: "Strong", min: 65, blurb: "Well-rounded and raid/key ready." },
  { label: "Developing", min: 40, blurb: "Solid base with clear next steps." },
  { label: "Early", min: 0, blurb: "Foundations are forming — keep pushing." },
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
          Overall character score
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
          {score}
          <span className="text-base font-normal text-white/40"> / 100</span>
        </p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/60">
          {band.blurb}
        </p>
      </div>
    </div>
  );
}
