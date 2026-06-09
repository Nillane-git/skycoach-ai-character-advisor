import type { CSSProperties } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { classColor } from "@/config/class-colors";

import { CharacterHeader } from "@/components/dashboard/character-header";
import { CharacterScore } from "@/components/dashboard/character-score";
import { ReadinessCards } from "@/components/dashboard/readiness-cards";
import { Strengths } from "@/components/dashboard/strengths";
import { Weaknesses } from "@/components/dashboard/weaknesses";
import { Bottlenecks } from "@/components/dashboard/bottlenecks";
import { ActionPlan } from "@/components/dashboard/action-plan";
import { Roadmap } from "@/components/dashboard/roadmap";
import { SkycoachCards } from "@/components/dashboard/skycoach-cards";
import { StatBreakdown } from "@/components/dashboard/stat-breakdown";
import { FallbackBanner } from "@/components/dashboard/fallback-banner";
import { Card, CardContent } from "@/components/ui/card";

export function Dashboard({ result }: { result: AnalysisResult }) {
  const { character, analysis, meta } = result;
  const accent = classColor(character.identity.className);
  const showFallback = meta.source === "fallback" && meta.keyExpected;

  return (
    <div
      className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:py-10"
      style={{ ["--accent"]: accent } as CSSProperties}
    >
      {showFallback ? <FallbackBanner /> : null}

      {/* Identity + headline score */}
      <Card>
        <CardContent className="flex flex-col gap-8 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <CharacterHeader character={character} />
          </div>
          <div className="flex justify-center lg:pl-8">
            <CharacterScore score={analysis.characterScore} />
          </div>
        </CardContent>
      </Card>

      {/* Readiness */}
      <ReadinessCards readiness={analysis.readiness} />

      {/* Strengths + weaknesses side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Strengths strengths={analysis.strengths} />
        <Weaknesses weaknesses={analysis.weaknesses} />
      </div>

      {/* Bottlenecks */}
      <Bottlenecks bottlenecks={analysis.bottlenecks} />

      {/* Action plan + roadmap side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ActionPlan actionPlan={analysis.actionPlan} />
        <Roadmap roadmap={analysis.roadmap} />
      </div>

      {/* Raw stat breakdown */}
      <StatBreakdown character={character} />

      {/* SkyCoach acceleration offers */}
      <SkycoachCards suggestions={analysis.skycoachSuggestions} />
    </div>
  );
}
