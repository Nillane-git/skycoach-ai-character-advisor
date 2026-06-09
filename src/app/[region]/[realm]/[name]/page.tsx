import { notFound } from "next/navigation";
import { runAnalysis } from "@/lib/pipeline";
import { AppError } from "@/lib/errors";
import type { AnalysisResult } from "@/types/analysis";
import type { ErrorCode } from "@/lib/errors";
import { Dashboard } from "@/components/dashboard/dashboard";
import { ErrorState } from "@/components/error-state";

const VALID_REGIONS = new Set(["us", "eu", "kr", "tw"]);

interface PageProps {
  params: Promise<{ region: string; realm: string; name: string }>;
}

/**
 * Route segments arrive percent-encoded for non-ASCII values — e.g. the Cyrillic
 * names/realms of Russian-realm characters (Мунфарион, Ревущий фьорд). Decode so
 * the Raider.IO lookup receives the real name instead of "%D0%9C..." (which it
 * reports as "character not found"). Safe/idempotent for plain ASCII segments.
 */
function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function CharacterPage({ params }: PageProps) {
  const raw = await params;
  const region = raw.region;
  const realm = decodeParam(raw.realm);
  const name = decodeParam(raw.name);

  if (!VALID_REGIONS.has(region.toLowerCase())) {
    notFound();
  }

  // Resolve data inside the try/catch, but render JSX outside it — a thrown
  // render error must reach the route error boundary, not this handler.
  let result: AnalysisResult | null = null;
  let errorCode: ErrorCode | null = null;
  try {
    result = await runAnalysis(region, realm, name);
  } catch (e) {
    if (e instanceof AppError) {
      errorCode = e.code;
    } else {
      throw e;
    }
  }

  if (errorCode) {
    return <ErrorState code={errorCode} />;
  }
  return <Dashboard result={result!} />;
}
