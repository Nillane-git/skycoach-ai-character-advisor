import { ListChecks } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ActionPlan({ actionPlan }: { actionPlan: string[] }) {
  if (actionPlan.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="size-4 text-[var(--accent)]" aria-hidden="true" />
          Action Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {actionPlan.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[var(--accent)]/10 text-xs font-semibold text-[var(--accent)]">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
