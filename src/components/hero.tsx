import { Sparkles } from "lucide-react";
import { SearchForm } from "@/components/search-form";

export function Hero() {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-4 py-16 sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-64 max-w-2xl rounded-full bg-[var(--accent)]/15 blur-3xl"
      />

      <div className="flex flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
          <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
          AI-коуч прогресса в WoW
        </span>

        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Разбери своего WoW-персонажа
        </h1>
        <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-white/60 sm:text-lg">
          AI-анализ прогресса экипировки, Mythic+, готовности к рейду и
          следующих шагов.
        </p>
      </div>

      <div className="mt-10">
        <SearchForm />
      </div>
    </section>
  );
}
