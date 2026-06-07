import { Map as MapIcon } from "lucide-react";
import type { RoadmapStep } from "@/types/analysis";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Roadmap({ roadmap }: { roadmap: RoadmapStep[] }) {
  if (roadmap.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="size-4 text-[var(--accent)]" aria-hidden="true" />
          Progression Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-6">
          {roadmap.map((s, i) => (
            <li key={s.step} className="relative pl-10">
              {i < roadmap.length - 1 ? (
                <span
                  className="absolute left-[15px] top-8 h-[calc(100%+0.5rem)] w-px bg-white/10"
                  aria-hidden="true"
                />
              ) : null}
              <span className="absolute left-0 top-0 flex size-8 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 text-sm font-semibold text-[var(--accent)]">
                {s.step}
              </span>
              <h4 className="text-sm font-semibold text-white">{s.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
