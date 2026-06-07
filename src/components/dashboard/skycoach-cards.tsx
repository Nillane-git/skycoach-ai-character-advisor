import { Rocket, ArrowUpRight } from "lucide-react";
import type { Suggestion } from "@/types/analysis";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { SKYCOACH_CARDS } from "@/config/skycoach";

/**
 * The three fixed SkyCoach acceleration offers. Descriptions come from the
 * finalized analysis (tailored to findings); titles, CTAs and links stay
 * canonical from @/config/skycoach.
 */
export function SkycoachCards({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Rocket className="size-4 text-[var(--accent)]" aria-hidden="true" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
          Accelerate with SkyCoach
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SKYCOACH_CARDS.map((fixed, i) => {
          const suggestion = suggestions[i];
          const description = suggestion?.description ?? fixed.description;
          return (
            <Card
              key={fixed.title}
              className="flex flex-col bg-gradient-to-b from-white/[0.05] to-transparent"
            >
              <CardHeader>
                <CardTitle>{fixed.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1" />
              <CardFooter>
                <a
                  href={fixed.href}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  {fixed.cta}
                  <ArrowUpRight />
                </a>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
