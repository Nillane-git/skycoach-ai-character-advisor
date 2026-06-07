import { runAnalysis } from "@/lib/pipeline";
import { rateLimit } from "@/lib/rate-limit";
import { AppError } from "@/lib/errors";
import type { Region } from "@/types/character";

export const runtime = "nodejs";

const VALID_REGIONS: readonly Region[] = ["us", "eu", "kr", "tw"];

interface AnalyzeRequestBody {
  region?: unknown;
  realm?: unknown;
  name?: unknown;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

/** First hop of X-Forwarded-For, or "local" when absent. */
function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return "local";
}

export async function POST(req: Request): Promise<Response> {
  // --- Parse + validate -----------------------------------------------------
  let body: AnalyzeRequestBody;
  try {
    body = (await req.json()) as AnalyzeRequestBody;
  } catch {
    return Response.json(
      { code: "INVALID_INPUT", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const { region, realm, name } = body;

  if (
    typeof region !== "string" ||
    !VALID_REGIONS.includes(region as Region) ||
    !isNonEmptyString(realm) ||
    !isNonEmptyString(name)
  ) {
    return Response.json(
      {
        code: "INVALID_INPUT",
        message:
          "region must be one of us, eu, kr, tw and realm/name must be non-empty.",
      },
      { status: 400 },
    );
  }

  // --- Per-IP rate limit ----------------------------------------------------
  const limit = rateLimit(clientIp(req), { windowMs: 60_000, max: 20 });
  if (!limit.ok) {
    return Response.json(
      { code: "OUR_RATE_LIMIT", message: "Too many requests. Slow down." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfter) },
      },
    );
  }

  // --- Run pipeline ---------------------------------------------------------
  try {
    const result = await runAnalysis(region, realm, name);
    return Response.json(result);
  } catch (e) {
    if (e instanceof AppError) {
      return Response.json(
        { code: e.code, message: e.message },
        { status: e.httpStatus },
      );
    }
    console.error("[api/analyze] unexpected error:", e);
    return Response.json(
      { code: "UNKNOWN", message: "Something went wrong." },
      { status: 500 },
    );
  }
}
