import { Info, Sparkles } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Shown whenever the qualitative report came from the deterministic fallback
 * engine instead of Claude. Two cases:
 *   - keyExpected=false: no AI key is configured (the demo/test scenario) —
 *     explain that with an AI API token the text would be model-written.
 *   - keyExpected=true:  a key is set but the Claude request failed — a
 *     temporary degradation notice.
 * In both cases the NUMBERS (score, readiness) are formula-derived and identical.
 */
export function FallbackBanner({ keyExpected }: { keyExpected: boolean }) {
  if (keyExpected) {
    return (
      <Alert variant="warning">
        <Info aria-hidden="true" />
        <AlertTitle>AI временно недоступен</AlertTitle>
        <AlertDescription>
          AI-ключ настроен, но запрос к модели не прошёл — текст показан из
          встроенного детерминированного движка как запасной вариант. Все числа
          точные; обновите страницу, чтобы повторить AI-генерацию.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="info">
      <Sparkles aria-hidden="true" />
      <AlertTitle>Демо-режим: отчёт без AI-ключа</AlertTitle>
      <AlertDescription>
        Текстовые разделы (сильные стороны, зоны роста, узкие места, план
        действий, дорожная карта) сейчас пишет встроенный детерминированный
        движок — приложение работает без секретов. С подключённым{" "}
        <strong>AI API-токеном (Anthropic Claude)</strong> эти разделы
        генерировала бы модель: персональнее, с учётом контекста персонажа. Все
        числовые показатели (оценка и готовность) всегда считаются формулами и
        одинаковы в обоих режимах.
      </AlertDescription>
    </Alert>
  );
}
