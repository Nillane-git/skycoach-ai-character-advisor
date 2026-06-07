import { Shirt, Gauge, ShieldHalf, Compass } from "lucide-react";
import type { NormalizedCharacter } from "@/types/character";
import { SCORING } from "@/config/scoring";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatBreakdown({
  character,
}: {
  character: NormalizedCharacter;
}) {
  const { itemLevel, mythicPlus, currentRaid } = character;
  const poolSize = SCORING.dungeons.poolSize;

  const stats: { icon: typeof Shirt; label: string; value: string }[] = [
    {
      icon: Shirt,
      label: "Item Level",
      value: `${itemLevel.equipped} eq · ${itemLevel.total} max`,
    },
    {
      icon: Gauge,
      label: "Mythic+ Rating",
      value: mythicPlus.ratingByRole.toLocaleString("en-US"),
    },
    {
      icon: ShieldHalf,
      label: "Raid Progress",
      value: currentRaid
        ? `${currentRaid.name} · ${currentRaid.summary}`
        : "No raid progress",
    },
    {
      icon: Compass,
      label: "Dungeon Coverage",
      value: `${mythicPlus.distinctDungeonsAtOrAbove10}/${poolSize} at +10`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stat Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5"
            >
              <dt className="flex items-center gap-2 text-sm text-white/55">
                <Icon className="size-4 text-white/40" aria-hidden="true" />
                {label}
              </dt>
              <dd>
                <Badge variant="outline" className="font-medium">
                  {value}
                </Badge>
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
