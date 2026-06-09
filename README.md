# SkyCoach AI — Character Advisor

**Live:** https://821723.cloud4box.ru/ · **Deploy:** [`deploy.md`](deploy.md)

An AI-powered World of Warcraft character advisor. Enter a character (region /
realm / name) and SkyCoach analyzes gear progression, Mythic+ rating, raid
readiness, and surfaces concrete next steps — plus a deterministic, formula-driven
character score and per-tier readiness, with an AI-written qualitative report on
top.

Data comes from the public [Raider.IO](https://raider.io) API (no key needed).
The qualitative analysis is written by Claude when an Anthropic key is present,
and falls back to a deterministic local report otherwise. **All numbers
(characterScore, readiness) are always computed by formulas — Claude never
computes them**, so the score is stable and reproducible.

Built with Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4,
and `@anthropic-ai/sdk`.

## Quickstart

```bash
npm install
npm run dev
```

Open <http://localhost:3000>, then enter a region / realm / character — or jump
straight to the bundled demo character:

- **Demo character:** <http://localhost:3000/us/demo/skycoach>

The demo resolves from a local fixture (no network call), so it works offline and
with no API key.

> This repo uses **npm** (pnpm is unavailable in the build sandbox). Either
> package manager works on Vercel — pick whichever your deploy is configured for.

## Environment

Copy `.env.example` to `.env.local` and fill in as needed:

| Variable            | Default | Meaning                                                                                   |
| ------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `ANTHROPIC_API_KEY` | _empty_ | **Optional.** When set, Claude writes the qualitative report. When empty, a deterministic local fallback report is used instead. |
| `DEMO_MODE`         | `0`     | `1` → offline demo: every character resolves from local fixtures, no Raider.IO/Claude calls. |

When the key is expected (it _looks_ like Claude should run) but the call fails or
no key is present, the dashboard shows a small "AI brain unavailable — showing a
deterministic report" banner. The report is still fully populated.

## Scoring formula

The single source of truth for ceilings/weights is `src/config/scoring.ts`
(**UPDATE EACH SEASON**). Everything is normalized to 0–100 and clamped.

`characterScore` is a weighted blend:

```
characterScore = round(
    normItemLevel(equipped)        * 0.40   // (eq - 580) / (639 - 580) * 100
  + normMythicPlus(ratingByRole)   * 0.30   // rating / 3000 * 100
  + normRaid(n, h, m, total)       * 0.20   // (n*1 + h*2 + m*3) / (total*3) * 100
  + normDungeonCoverage(distinct)  * 0.10   // distinct +10 dungeons / 8 * 100
)
```

If the character has no current raid, the raid term is 0.

**Readiness** (0–100 each):

- `mythicPlus` = `round(normMythicPlus(ratingByRole))`.
- `heroicRaid` / `mythicRaid` blend item-level readiness toward a target ilvl
  (606 heroic / 619 mythic, ±20 band) with actual boss progress at that
  difficulty: `round(ilvlReadiness * 0.6 + raidProgress * 0.4)`.

## Tests

```bash
npm test            # unit tests (Vitest)        -> tests/unit/**
npm run test:watch  # unit tests in watch mode
npm run test:e2e    # end-to-end tests (Playwright) -> tests/e2e/**
npm run typecheck   # tsc --noEmit
```

- **Unit tests** (`tests/unit/`) cover normalization, scoring, readiness, the
  raid selector, realm-slug rules, Raider.IO error mapping, and the
  analyzer contract (fallback determinism + finalize count/number enforcement).
  They build small in-test `NormalizedCharacter` fixtures and are fully
  deterministic.
- **E2E** (`tests/e2e/`) boots the app with `DEMO_MODE=1` on port 3100 and
  asserts the demo dashboard renders all analysis sections, the score, readiness
  cards, the three SkyCoach cards, and the fallback banner (CI runs without an
  Anthropic key).

## Notes

- **Cache and rate-limit are in-memory and ephemeral.** The character cache
  (`src/lib/cache.ts`) and per-IP rate limiter (`src/lib/rate-limit.ts`) are
  plain module-level `Map`s. They reset on every cold start / new serverless
  instance and are **not** shared across instances — fine for a single-process
  dev server or a warm Vercel function, but not a durable store.

## Deploy

Standard Next.js deploy (e.g. Vercel). Set `ANTHROPIC_API_KEY` in the project's
environment to enable the Claude-authored report; leave it unset to ship the
deterministic fallback.
