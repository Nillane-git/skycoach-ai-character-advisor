export type ErrorCode =
  | "CHARACTER_NOT_FOUND"
  | "REALM_NOT_FOUND"
  | "RAIDERIO_UNAVAILABLE"
  | "RAIDERIO_RATE_LIMIT"
  | "EMPTY_OR_MALFORMED"
  | "INVALID_INPUT"
  | "OUR_RATE_LIMIT"
  | "UNKNOWN";

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public httpStatus = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}
