import { notFound } from "next/navigation";
import { runAnalysis } from "@/lib/pipeline";
import { AppError } from "@/lib/errors";
import { Dashboard } from "@/components/dashboard/dashboard";
import { ErrorState } from "@/components/error-state";

const VALID_REGIONS = new Set(["us", "eu", "kr", "tw"]);

interface PageProps {
  params: Promise<{ region: string; realm: string; name: string }>;
}

export default async function CharacterPage({ params }: PageProps) {
  const { region, realm, name } = await params;

  if (!VALID_REGIONS.has(region.toLowerCase())) {
    notFound();
  }

  try {
    const result = await runAnalysis(region, realm, name);
    return <Dashboard result={result} />;
  } catch (e) {
    if (e instanceof AppError) {
      return <ErrorState code={e.code} />;
    }
    throw e;
  }
}
