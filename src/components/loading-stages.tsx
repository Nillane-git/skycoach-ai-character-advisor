"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES = [
  "Проверяем профиль персонажа...",
  "Анализируем экипировку...",
  "Анализируем прогресс Mythic+...",
  "Анализируем историю рейдов...",
  "Сравниваем с похожими игроками...",
  "Генерируем AI-отчёт...",
] as const;

const STEP_MS = 900;

/**
 * Purely cosmetic loading indicator. Cycles through the six analysis stages,
 * marking earlier ones complete with a check and shimmering the active one.
 * Loops until the route finishes loading and React swaps it out.
 */
export function LoadingStages() {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % STAGES.length);
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Собираем твой отчёт
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Превращаем экипировку, ключи и рейд-логи в понятный план.
        </p>
      </div>

      <ol className="space-y-3">
        {STAGES.map((stage, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li
              key={stage}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                current
                  ? "border-white/15 bg-white/5"
                  : "border-white/5 bg-transparent",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                  done
                    ? "border-transparent bg-[var(--accent)] text-black"
                    : current
                      ? "border-white/20 text-white"
                      : "border-white/10 text-white/30",
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden="true" />
                ) : current ? (
                  <Loader2
                    className="size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>

              <span
                className={cn(
                  "text-sm transition-colors",
                  done
                    ? "text-white/50"
                    : current
                      ? "font-medium text-white"
                      : "text-white/30",
                )}
              >
                {stage}
              </span>

              {current ? (
                <span className="relative ml-auto h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                  <span className="shimmer absolute inset-y-0 left-0 w-1/2 rounded-full bg-[var(--accent)]/70" />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <style>{`
        @keyframes skycoach-shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(240%); }
        }
        .shimmer { animation: skycoach-shimmer 1.1s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
