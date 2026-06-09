import { Fragment, type CSSProperties } from "react";
import { Sparkles, Activity, ListChecks, Map } from "lucide-react";
import { SearchForm } from "@/components/search-form";

// "What you get" strip — mirrors the real report sections, sets honest
// expectations before the user runs an analysis.
const REPORT_ITEMS = [
  { icon: Sparkles, label: "Оценка персонажа" },
  { icon: Activity, label: "Готовность к контенту" },
  { icon: ListChecks, label: "План действий" },
  { icon: Map, label: "Дорожная карта" },
];

export function Hero() {
  return (
    <section
      className="relative mx-auto flex w-full max-w-[760px] flex-col items-center px-6 py-14 text-center sm:py-20"
      // Landing accent defaults to the Mage-cyan from the prototype; the
      // dashboard overrides --accent per character class.
      style={{ "--accent": "#3fc7eb" } as CSSProperties}
    >
      <span
        className="reveal d1 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-wide text-white/70"
        style={{
          borderColor: "color-mix(in srgb, var(--accent) 30%, rgba(255,255,255,0.1))",
          background: "color-mix(in srgb, var(--accent) 9%, transparent)",
        }}
      >
        <Sparkles className="size-3.5 text-[var(--accent)]" aria-hidden="true" />
        AI-коуч прогресса в World of Warcraft
      </span>

      <h1 className="reveal d1 mt-6 text-balance font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl">
        Разбери своего{" "}
        <span
          className="text-[var(--accent)]"
          style={{
            textShadow: "0 0 36px color-mix(in srgb, var(--accent) 40%, transparent)",
          }}
        >
          персонажа
        </span>
      </h1>

      <p className="reveal d2 mt-5 max-w-[540px] text-pretty text-base leading-relaxed text-white/65 sm:text-lg">
        Оценка экипировки, Mythic+, готовности к рейду и понятный план
        следующих шагов — за один разбор. Данные тянутся из Raider.IO, ключ не
        нужен.
      </p>

      <div className="reveal d3 mt-10 w-full max-w-[620px]">
        <SearchForm />
      </div>

      <div className="reveal d4 mt-8 flex max-w-[620px] flex-wrap items-center justify-center gap-x-5 gap-y-2.5">
        {REPORT_ITEMS.map(({ icon: Icon, label }, i) => (
          <Fragment key={label}>
            {i > 0 ? (
              <span
                className="hidden size-1 rounded-full bg-white/15 sm:block"
                aria-hidden="true"
              />
            ) : null}
            <span className="inline-flex items-center gap-2 text-xs font-medium text-white/45">
              <Icon className="size-[15px] text-[var(--accent)]" aria-hidden="true" />
              {label}
            </span>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
