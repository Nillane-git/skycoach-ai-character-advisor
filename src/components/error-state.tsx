import Link from "next/link";
import {
  UserX,
  MapPinOff,
  ServerCrash,
  Timer,
  FileWarning,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import type { ErrorCode } from "@/lib/errors";
import { realmSlug, normalizeName } from "@/lib/raiderio/slug";
import { buttonVariants } from "@/components/ui/button";

interface Copy {
  icon: LucideIcon;
  title: string;
  body: string;
}

const COPY: Record<ErrorCode, Copy> = {
  CHARACTER_NOT_FOUND: {
    icon: UserX,
    title: "Персонаж не найден",
    body: "Не нашли такого персонажа на Raider.IO. Проверь имя, сервер и регион — регистр не важен, а вот написание важно.",
  },
  REALM_NOT_FOUND: {
    icon: MapPinOff,
    title: "Сервер не найден",
    body: "Такого сервера нет в выбранном регионе. Убедись, что выбрал правильный регион и верно написал название сервера.",
  },
  RAIDERIO_UNAVAILABLE: {
    icon: ServerCrash,
    title: "Raider.IO недоступен",
    body: "Сервис Raider.IO не ответил вовремя. Обычно это временно — попробуй ещё раз через минуту.",
  },
  RAIDERIO_RATE_LIMIT: {
    icon: Timer,
    title: "Raider.IO ограничивает запросы",
    body: "Сейчас на Raider.IO много трафика. Подожди минуту и повтори запрос.",
  },
  EMPTY_OR_MALFORMED: {
    icon: FileWarning,
    title: "Пока нет данных о прогрессе",
    body: "Персонаж существует, но у него нет экипировки, Mythic+ или истории рейдов для анализа. Попробуй более активного персонажа.",
  },
  INVALID_INPUT: {
    icon: AlertTriangle,
    title: "Проверь запрос",
    body: "Что-то в запросе выглядит некорректно. Выбери регион и введи сервер и имя персонажа.",
  },
  OUR_RATE_LIMIT: {
    icon: Timer,
    title: "Слишком много запросов",
    body: "Ты запустил много анализов за короткое время. Сделай небольшую паузу и попробуй снова.",
  },
  UNKNOWN: {
    icon: AlertTriangle,
    title: "Что-то пошло не так",
    body: "При сборке отчёта произошла непредвиденная ошибка. Попробуй ещё раз или посмотри другого персонажа.",
  },
};

// Only the "nothing found / no data" screens get the verify panel — never the
// success dashboard or the initial search, and not transient Raider.IO outages
// (rate-limit / unavailable), where the character may well exist.
const NOT_FOUND_CODES: ReadonlySet<ErrorCode> = new Set<ErrorCode>([
  "CHARACTER_NOT_FOUND",
  "REALM_NOT_FOUND",
  "EMPTY_OR_MALFORMED",
]);

// Mirrors src/lib/raiderio/client.ts so the link reproduces the EXACT request.
const RAIDERIO_FIELDS =
  "gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs,raid_progression";

interface ErrorStateProps {
  code: ErrorCode;
  region?: string;
  realm?: string;
  name?: string;
}

/**
 * Builds the exact Raider.IO endpoints for the attempted character so a reviewer
 * can confirm at the source whether "not found" is Raider.IO's answer or ours.
 */
function raiderioLinks(region: string, realm: string, name: string) {
  const slug = realmSlug(realm);
  const normName = normalizeName(name);
  const api =
    "https://raider.io/api/v1/characters/profile?" +
    new URLSearchParams({
      region,
      realm: slug,
      name: normName,
      fields: RAIDERIO_FIELDS,
    }).toString();
  const page = `https://raider.io/characters/${region}/${slug}/${encodeURIComponent(
    normName,
  )}`;
  return { api, page };
}

export function ErrorState({ code, region, realm, name }: ErrorStateProps) {
  const { icon: Icon, title, body } = COPY[code] ?? COPY.UNKNOWN;
  const showVerify =
    NOT_FOUND_CODES.has(code) && !!region && !!realm && !!name;
  const links = showVerify
    ? raiderioLinks(region!, realm!, name!)
    : null;

  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
        <Icon className="size-7 text-white/70" aria-hidden="true" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-white">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
        {body}
      </p>
      <code className="mt-4 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-white/40">
        {code}
      </code>

      {links ? (
        <div className="mt-8 w-full rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Проверить источник
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/60">
            Данные мы берём <strong>только из Raider.IO</strong> — своей базы
            персонажей у нас нет. Открой эти ссылки и убедись сам: это ответ
            Raider.IO, а не нашего сервиса.
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <a
              href={links.page}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Открыть персонажа на Raider.IO
            </a>
            <a
              href={links.api}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 break-all text-sm font-medium text-[var(--accent)] hover:underline"
            >
              <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
              Сырой ответ Raider.IO API (JSON) — тот самый запрос, что делаем мы
            </a>
          </div>
        </div>
      ) : null}

      <Link
        href="/"
        className={buttonVariants({ variant: "secondary", className: "mt-8" })}
      >
        Посмотреть другого персонажа
        <ArrowRight />
      </Link>
    </section>
  );
}
