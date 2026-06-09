import Link from "next/link";
import {
  UserX,
  MapPinOff,
  ServerCrash,
  Timer,
  FileWarning,
  AlertTriangle,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import type { ErrorCode } from "@/lib/errors";
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

export function ErrorState({ code }: { code: ErrorCode }) {
  const { icon: Icon, title, body } = COPY[code] ?? COPY.UNKNOWN;

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
