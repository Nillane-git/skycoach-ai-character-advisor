import { Shield, Heart, Swords, UserRound } from "lucide-react";
import type { NormalizedCharacter, Role } from "@/types/character";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const ROLE_META: Record<Role, { label: string; icon: typeof Shield }> = {
  TANK: { label: "Танк", icon: Shield },
  HEALER: { label: "Хилер", icon: Heart },
  DPS: { label: "ДД", icon: Swords },
};

export function CharacterHeader({
  character,
}: {
  character: NormalizedCharacter;
}) {
  const { identity } = character;
  const role = ROLE_META[identity.role];
  const RoleIcon = role.icon;
  const faction = identity.faction.toLowerCase();
  const factionClass =
    faction === "alliance"
      ? "text-sky-300"
      : faction === "horde"
        ? "text-red-300"
        : "text-white/60";
  const factionLabel =
    faction === "alliance" ? "Альянс" : faction === "horde" ? "Орда" : identity.faction;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
        {identity.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote RIO avatar, no domain config needed
          <img
            src={identity.thumbnailUrl}
            alt={`${identity.name} portrait`}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-white/30">
            <UserRound className="size-7" aria-hidden="true" />
          </div>
        )}
        <span
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset"
          style={{ boxShadow: "inset 0 0 0 2px color-mix(in srgb, var(--accent) 60%, transparent)" }}
        />
      </div>

      <div className="min-w-0 flex-1">
        <h1
          className="truncate text-2xl font-semibold tracking-tight"
          style={{ color: "var(--accent)" }}
        >
          {identity.name}
        </h1>
        <p className="mt-0.5 text-sm text-white/60">
          {identity.realm} · {identity.region.toUpperCase()}
        </p>
        <p className="mt-1 text-sm text-white/80">
          {identity.race} {identity.spec} {identity.className}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge>
          <RoleIcon />
          {role.label}
        </Badge>
        <Badge variant="outline" className={cn(factionClass)}>
          {factionLabel}
        </Badge>
      </div>
    </div>
  );
}
