"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { realmSlug } from "@/lib/raiderio/slug";
import type { Region } from "@/types/character";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const REGIONS: { value: Region; label: string }[] = [
  { value: "us", label: "US" },
  { value: "eu", label: "EU" },
  { value: "kr", label: "KR" },
  { value: "tw", label: "TW" },
];

export function SearchForm() {
  const router = useRouter();
  const [region, setRegion] = React.useState<Region>("us");
  const [realm, setRealm] = React.useState("");
  const [name, setName] = React.useState("");

  const canSubmit = realm.trim().length > 0 && name.trim().length > 0;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    const slug = realmSlug(realm);
    if (!slug) return;
    router.push(`/${region}/${slug}/${encodeURIComponent(name.trim())}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-white/10 bg-[var(--card)] p-5 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]"
    >
      {/* Region — segmented control */}
      <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-white/40">
        Регион
      </Label>
      <div
        role="group"
        aria-label="Регион"
        className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1"
      >
        {REGIONS.map((r) => {
          const active = region === r.value;
          return (
            <button
              key={r.value}
              type="button"
              aria-pressed={active}
              onClick={() => setRegion(r.value)}
              className={cn(
                "h-9 flex-1 rounded-lg text-sm font-semibold tracking-wide transition-colors",
                active
                  ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "text-white/65 hover:bg-white/5 hover:text-white",
              )}
              style={
                active
                  ? {
                      boxShadow:
                        "0 0 16px color-mix(in srgb, var(--accent) 30%, transparent)",
                    }
                  : undefined
              }
            >
              {r.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="realm"
            className="text-[11px] font-semibold uppercase tracking-wider text-white/40"
          >
            Сервер
          </Label>
          <Input
            id="realm"
            value={realm}
            onChange={(e) => setRealm(e.target.value)}
            placeholder="Twisting Nether"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="name"
            className="text-[11px] font-semibold uppercase tracking-wider text-white/40"
          >
            Персонаж
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kelthuzad"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-[var(--accent)] px-6 text-[15px] font-bold text-[var(--accent-foreground)] transition-all hover:-translate-y-px hover:brightness-110 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:brightness-100"
          style={
            canSubmit
              ? {
                  boxShadow:
                    "0 0 28px color-mix(in srgb, var(--accent) 36%, transparent)",
                }
              : undefined
          }
        >
          <Search className="size-[17px]" aria-hidden="true" />
          Анализировать
        </button>

        <Link
          href="/us/demo/skycoach"
          className="inline-flex h-9 items-center justify-center gap-1.5 self-start rounded-full border border-white/10 bg-white/[0.03] px-4 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
        >
          <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
          Попробовать демо-персонажа
        </Link>
      </div>
    </form>
  );
}
