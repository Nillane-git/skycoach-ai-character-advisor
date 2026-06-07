import { describe, it, expect } from "vitest";
import { mapRaiderIoError } from "@/lib/raiderio/errors";
import { AppError } from "@/lib/errors";

// Raider.IO returns business errors as HTTP 400 with { statusCode, error,
// message }. mapRaiderIoError classifies by status (429) then by lowercased
// message substring, defaulting anything unrecognized to EMPTY_OR_MALFORMED.

describe("mapRaiderIoError", () => {
  it("maps 'could not find requested character' to CHARACTER_NOT_FOUND", () => {
    const err = mapRaiderIoError(400, {
      statusCode: 400,
      error: "Bad Request",
      message: "Could not find requested character",
    });
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("CHARACTER_NOT_FOUND");
  });

  it("maps 'failed to find realm' to REALM_NOT_FOUND", () => {
    const err = mapRaiderIoError(400, {
      statusCode: 400,
      error: "Bad Request",
      message: "Failed to find realm",
    });
    expect(err.code).toBe("REALM_NOT_FOUND");
  });

  it("maps HTTP 429 to RAIDERIO_RATE_LIMIT regardless of body", () => {
    const err = mapRaiderIoError(429, {});
    expect(err.code).toBe("RAIDERIO_RATE_LIMIT");
    expect(err.httpStatus).toBe(429);
  });

  it("maps a 5xx-style status with no matching message to EMPTY_OR_MALFORMED", () => {
    const err = mapRaiderIoError(500, {
      statusCode: 500,
      error: "Internal Server Error",
      message: "something exploded",
    });
    expect(err.code).toBe("EMPTY_OR_MALFORMED");
  });

  it("maps an unrecognized 400 to EMPTY_OR_MALFORMED", () => {
    const err = mapRaiderIoError(400, {
      statusCode: 400,
      error: "Bad Request",
      message: "some other unexpected message",
    });
    expect(err.code).toBe("EMPTY_OR_MALFORMED");
  });
});
