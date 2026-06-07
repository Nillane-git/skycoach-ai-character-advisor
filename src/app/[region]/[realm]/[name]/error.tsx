"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/error-state";
import { Button } from "@/components/ui/button";

export default function CharacterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[character page] unhandled error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-6 py-16">
      <ErrorState code="UNKNOWN" />
      <Button variant="outline" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
