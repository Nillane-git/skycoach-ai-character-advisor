"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "skycoach-welcome-dismissed";

/**
 * A small welcome dialog shown on first visit. Introduces the project as a
 * test-task demo and points the visitor at the demo character. Dismissal is
 * remembered in localStorage so a returning reviewer is not nagged.
 */
export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* no storage available — still show the welcome */
    }
    // Reading a browser-only API after mount is the correct place to decide
    // visibility (doing it during render would cause an SSR hydration mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!dismissed) setOpen(true);
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close welcome"
        onClick={close}
        className="absolute inset-0 bg-black/75"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#14171c] shadow-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[var(--accent,#7C8CF8)]/20 blur-2xl"
        />
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-3 top-3 rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>

        <div className="relative p-6 sm:p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
            <Sparkles className="size-3.5 text-[var(--accent,#7C8CF8)]" aria-hidden="true" />
            Test-task demo
          </span>

          <h2
            id="welcome-title"
            className="mt-4 text-2xl font-semibold tracking-tight text-white"
          >
            Welcome 👋
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            This is a demo of <strong className="text-white">SkyCoach AI Character Advisor</strong> — a
            test assignment. Enter any World of Warcraft character and it pulls
            live data from Raider.IO, then generates a progression report:
            character score, readiness, strengths, bottlenecks, an action plan
            and a roadmap.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-white/45">
            Runs with zero configuration — the analysis engine works without any
            API key. Try the demo character below, or type your own.
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/us/demo/skycoach"
              onClick={close}
              className={cn(buttonVariants(), "sm:flex-1")}
            >
              Try the demo character
            </Link>
            <Button variant="outline" onClick={close} className="sm:flex-1">
              Explore on my own
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
