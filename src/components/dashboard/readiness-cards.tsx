import { Swords, ShieldHalf, Crown } from "lucide-react";
import type { Readiness } from "@/types/analysis";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreDial } from "@/components/score-dial";
import { rarityColor, rarityLabel } from "@/config/rarity";

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

/**
 * Three readiness tiers as radial dials. The arc is accent-colored (class
 * color); the tier pill below is colored by the value's rarity so a weak
 * tier (e.g. Mythic raid) reads instantly against the strong ones.
 */
export function ReadinessCards({ readiness }: { readiness: Readiness }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {ITEMS.map(({ key, label, icon: Icon, hint }) => {
        const value = readiness[key];
        const tier = rarityColor(value);
        return (
          <Card key={key} className="bg-white/[0.03]">
            <CardContent className="flex flex-col items-center gap-2 p-6 text-center">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Icon className="size-4 text-[var(--accent)]" aria-hidden="true" />
                {label}
              </div>

              <ScoreDial value={value} size={128} className="my-2" />

              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                style={{ color: tier }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: tier, boxShadow: `0 0 8px ${tier}` }}
                />
                {rarityLabel(value)}
              </span>

              <p className="text-xs text-white/40">{hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
