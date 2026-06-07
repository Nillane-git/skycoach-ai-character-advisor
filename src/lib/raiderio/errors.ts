import { AppError } from "@/lib/errors";

// Raider.IO returns ALL business errors as HTTP 400 with body
// { statusCode, error, message }. We map by lowercased message substring.
// HTTP 429 -> rate limit. Anything not otherwise classified -> malformed.

interface RaiderIoErrorBody {
  statusCode?: number;
  error?: string;
  message?: string;
}

function extractMessage(body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    const msg = (body as RaiderIoErrorBody).message;
    if (typeof msg === "string") return msg.toLowerCase();
  }
  return "";
}

export function mapRaiderIoError(status: number, body: unknown): AppError {
  if (status === 429) {
    return new AppError(
      "RAIDERIO_RATE_LIMIT",
      "Raider.IO rate limit reached. Please try again shortly.",
      429,
    );
  }

  const message = extractMessage(body);

  if (message.includes("could not find requested character")) {
    return new AppError(
      "CHARACTER_NOT_FOUND",
      "We couldn't find that character on Raider.IO.",
      404,
    );
  }

  if (message.includes("failed to find realm")) {
    return new AppError(
      "REALM_NOT_FOUND",
      "We couldn't find that realm on Raider.IO.",
      404,
    );
  }

  // network/timeout/5xx are handled by the client (RAIDERIO_UNAVAILABLE);
  // any other 400 here is treated as an unexpected/malformed response.
  return new AppError(
    "EMPTY_OR_MALFORMED",
    "Raider.IO returned an unexpected response.",
    502,
  );
}
