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
    title: "Character not found",
    body: "We couldn't find that character on Raider.IO. Double-check the name, realm and region — capitalization doesn't matter, but spelling does.",
  },
  REALM_NOT_FOUND: {
    icon: MapPinOff,
    title: "Realm not found",
    body: "That realm isn't on record for the selected region. Make sure you picked the right region and spelled the realm correctly.",
  },
  RAIDERIO_UNAVAILABLE: {
    icon: ServerCrash,
    title: "Raider.IO is unavailable",
    body: "The Raider.IO service didn't respond in time. This is usually temporary — please try again in a moment.",
  },
  RAIDERIO_RATE_LIMIT: {
    icon: Timer,
    title: "Raider.IO is rate limiting",
    body: "Raider.IO is receiving a lot of traffic right now. Give it a minute and try your lookup again.",
  },
  EMPTY_OR_MALFORMED: {
    icon: FileWarning,
    title: "No progression data yet",
    body: "This character exists but has no gear, Mythic+ or raid history to analyze. Try a more active character.",
  },
  INVALID_INPUT: {
    icon: AlertTriangle,
    title: "Check your search",
    body: "Something about that request didn't look right. Pick a region and enter a realm and character name.",
  },
  OUR_RATE_LIMIT: {
    icon: Timer,
    title: "Too many requests",
    body: "You've run a lot of analyses in a short window. Take a short break and try again shortly.",
  },
  UNKNOWN: {
    icon: AlertTriangle,
    title: "Something went wrong",
    body: "An unexpected error occurred while building this report. Please try again, or look up a different character.",
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
        Try another character
        <ArrowRight />
      </Link>
    </section>
  );
}
