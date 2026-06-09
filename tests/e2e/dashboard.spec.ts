import { test, expect } from "@playwright/test";

// These run against `DEMO_MODE=1 npm run dev` (see playwright.config.ts), so
// the demo character resolves from the local fixture and — because CI has no
// ANTHROPIC_API_KEY — the deterministic fallback report is rendered. The UI is
// in Russian.

test.describe("demo dashboard", () => {
  test("renders the full analysis for the demo character", async ({ page }) => {
    await page.goto("/us/demo/skycoach");

    // Character header: the demo character's name is present (the demo fixture
    // is the real Raider.IO profile of Azunazx-Hyjal).
    await expect(
      page.getByRole("heading", { name: /azunazx/i }).first(),
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

    // Fallback notice: with no AI key (the demo scenario) the deterministic-
    // engine banner is shown, explaining that an AI API token would make these
    // text sections model-written.
    await expect(page.getByText(/Демо-режим/i)).toBeVisible();
    await expect(page.getByText(/AI API-токеном/i)).toBeVisible();
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

    await expect(page.getByText(/Разбери своего/i).first()).toBeVisible();
    // Region is a segmented button group (US/EU/KR/TW), not a <select>.
    await expect(page.getByRole("button", { name: "US" })).toBeVisible();
    await expect(page.locator("input").first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Анализировать/i }),
    ).toBeVisible();
  });

  test("Analyze navigates to the character route for a Latin realm", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Осмотреться/i }).click();

    await page.getByLabel(/Сервер/i).fill("Twisting Nether");
    await page.getByLabel(/Персонаж/i).fill("Kelthuzad");
    await page.getByRole("button", { name: /Анализировать/i }).click();

    await expect(page).toHaveURL(/\/us\/twisting-nether\/Kelthuzad$/);
  });

  test("Analyze navigates for a Cyrillic (RU) realm instead of no-op", async ({
    page,
  }) => {
    // Regression: the slug helper blanked out non-ASCII realms, so submit was
    // silently swallowed for RU realms ("button doesn't work on some chars").
    await page.goto("/");
    await page.getByRole("button", { name: /Осмотреться/i }).click();

    await page.getByLabel(/Сервер/i).fill("Гордунни");
    await page.getByLabel(/Персонаж/i).fill("Мунфарион");
    await page.getByRole("button", { name: /Анализировать/i }).click();

    // We must leave the home page (the bug kept us on "/"). The realm/name
    // segments are percent-encoded in the URL.
    await expect(page).not.toHaveURL(/\/$/);
    await expect(page).toHaveURL(/\/us\/.+\/.+/);
  });
});
