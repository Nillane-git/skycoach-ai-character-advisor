export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-white/40 sm:flex-row">
        <p>
          <span className="font-medium text-white/60">SkyCoach AI</span> —
          AI-анализ персонажа World of Warcraft.
        </p>
        <p>
          Данные персонажа через{" "}
          <a
            href="https://raider.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            Raider.IO
          </a>
          . Не аффилировано с Blizzard Entertainment.
        </p>
      </div>
    </footer>
  );
}
