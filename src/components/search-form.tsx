"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { realmSlug } from "@/lib/raiderio/slug";
import type { Region } from "@/types/character";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

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
    router.push(
      `/${region}/${slug}/${encodeURIComponent(name.trim())}`,
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-lg sm:p-5"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[7rem_1fr_1fr]">
        <div className="space-y-1.5">
          <Label htmlFor="region">Регион</Label>
          <Select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
          >
            {REGIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="realm">Сервер</Label>
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
          <Label htmlFor="name">Персонаж</Label>
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

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button type="submit" disabled={!canSubmit} className="sm:w-auto">
          <Search />
          Анализировать
        </Button>

        <Link
          href="/us/demo/skycoach"
          className="inline-flex items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          Попробовать демо-персонажа
        </Link>
      </div>
    </form>
  );
}
