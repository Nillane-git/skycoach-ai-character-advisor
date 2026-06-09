import { test, expect } from "@playwright/test";

// These run against `DEMO_MODE=1 npm run dev` (see playwright.config.ts), so
// the demo character resolves from the local fixture and — because CI has no
// ANTHROPIC_API_KEY — the deterministic fallback report is rendered. The UI is
// in Russian.

test.describe("demo dashboard", () => {
  test("renders the full analysis for the demo character", async ({ page }) => {
    await page.goto("/us/demo/skycoach");

    // Character header: the demo character's name is present.
    await expect(
      page.getByRole("heading", { name: /skycoach/i }).first(),
    ).toBeVisible();

    // Character score: a 0-100 integer rendered by the score panel.
    const scoreEl = page.getByTestId("character-score-value").first();
    await expect(scoreEl).toBeVisible();
    const score = Number(((await scoreEl.textContent()) ?? "").replace(/[^0-9]/g, ""));
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);

    // The analysis section headings (Russian).
    const sectionHeadings = [
      /Общая оценка персонажа/i,
      /Готовность/i,
      /Сильные стороны/i,
      /Зоны роста/i,
      /Узкие места/i,
      /План действий/i,
      /Дорожная карта/i,
      /Разбор показателей/i,
      /Ускорься со SkyCoach/i,
    ];
    for (const name of sectionHeadings) {
      await expect(page.getByText(name).first()).toBeVisible();
    }

    // Three readiness cards: Mythic+, Heroic raid, Mythic raid.
    await expect(page.getByText(/Mythic\+/).first()).toBeVisible();
    await expect(page.getByText(/Героик-рейд/i).first()).toBeVisible();
    await expect(page.getByText(/Мифик-рейд/i).first()).toBeVisible();

    // The three fixed SkyCoach suggestion cards (titles + CTAs), Russian.
    await expect(page.getByText("Прогрессируй быстрее").first()).toBeVisible();
    await expect(page.getByText("Экспертное сопровождение").first()).toBeVisible();
    await expect(page.getByText("Ускорь рост персонажа").first()).toBeVisible();
    await expect(page.getByText("Смотреть варианты").first()).toBeVisible();
    await expect(page.getByText("Подробнее").first()).toBeVisible();
    await expect(page.getByText("Услуги").first()).toBeVisible();

    // Fallback banner: hidden when no key is configured (deterministic is the
    // expected path), so the reviewer sees a clean dashboard.
    await expect(page.getByText(/детерминированный отчёт/i)).toHaveCount(0);
  });
});

test.describe("home page", () => {
  test("shows the Russian welcome modal, then the search form", async ({ page }) => {
    await page.goto("/");

    // Welcome modal (client-rendered) appears on first visit.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByText(/Демо тестового задания/i)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Попробовать демо-персонажа/i }).first(),
    ).toBeVisible();

    // Dismiss it and check the hero + search form underneath.
    await page.getByRole("button", { name: /Осмотреться/i }).click();
    await expect(dialog).toHaveCount(0);

    await expect(page.getByText(/Разбери своего WoW/i).first()).toBeVisible();
    await expect(page.locator("select").first()).toBeVisible();
    await expect(page.locator("input").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Анализировать/i }),
    ).toBeVisible();
  });
});
