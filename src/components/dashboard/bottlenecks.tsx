import { Fragment } from "react";
import { TrendingDown } from "lucide-react";
import type { Bottleneck } from "@/types/analysis";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Bottlenecks({ bottlenecks }: { bottlenecks: Bottleneck[] }) {
  if (bottlenecks.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="size-4 text-[var(--accent)]" aria-hidden="true" />
          Progression Bottlenecks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bottlenecks.map((b, i) => (
          <Fragment key={i}>
            {i > 0 ? <Separator /> : null}
            <div>
              <h4 className="text-sm font-semibold text-white">{b.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-white/60">
                {b.explanation}
              </p>
            </div>
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
}
