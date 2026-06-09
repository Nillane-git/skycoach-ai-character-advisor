import { AlertCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Weaknesses({ weaknesses }: { weaknesses: string[] }) {
  if (weaknesses.length === 0) return null;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="size-4 text-amber-400" aria-hidden="true" />
          Зоны роста
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {weaknesses.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-white/80">
              <AlertCircle
                className="mt-0.5 size-4 shrink-0 text-amber-400"
                aria-hidden="true"
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
