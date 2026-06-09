import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Shown only when the AI analysis fell back to the deterministic report
 * despite a key being expected. The dashboard gates rendering on
 * meta.source === "fallback" && meta.keyExpected.
 */
export function FallbackBanner() {
  return (
    <Alert variant="info">
      <Info aria-hidden="true" />
      <AlertTitle>AI-движок недоступен</AlertTitle>
      <AlertDescription>
        Показываем детерминированный отчёт. Все оценки и цифры готовности точные —
        только текстовые рекомендации сгенерированы формулой, а не AI.
      </AlertDescription>
    </Alert>
  );
}
