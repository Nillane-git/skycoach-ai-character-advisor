import Link from "next/link";
import { Swords } from "lucide-react";

const NAV = [
  { label: "Анализ", href: "/" },
  { label: "Демо", href: "/us/demo/skycoach" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <Swords className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">
            SkyCoach AI
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
