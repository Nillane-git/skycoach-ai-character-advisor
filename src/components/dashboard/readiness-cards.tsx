import { Swords, ShieldHalf, Crown } from "lucide-react";
import type { Readiness } from "@/types/analysis";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ReadinessItem {
  key: keyof Readiness;
  label: string;
  icon: typeof Swords;
  hint: string;
}

const ITEMS: ReadinessItem[] = [
  {
    key: "mythicPlus",
    label: "Готовность к Mythic+",
    icon: Swords,
    hint: "Сила пуша ключей",
  },
  {
    key: "heroicRaid",
    label: "Героик-рейд",
    icon: ShieldHalf,
    hint: "Экипировка и прогресс под героик",
  },
  {
    key: "mythicRaid",
    label: "Мифик-рейд",
    icon: Crown,
    hint: "Экипировка и прогресс под мифик",
  },
];

export function ReadinessCards({ readiness }: { readiness: Readiness }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ITEMS.map(({ key, label, icon: Icon, hint }) => {
        const value = readiness[key];
        return (
          <Card key={key} className="bg-white/[0.03]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-white/80">
                  <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
                  {label}
                </CardTitle>
                <span className="text-lg font-semibold tabular-nums text-white">
                  {value}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Progress value={value} />
              <p className="mt-2 text-xs text-white/40">{hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
