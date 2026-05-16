export type ApiErrorCode =
  | "LOCATION_NOT_FOUND"
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly source?: string;

  constructor(code: ApiErrorCode, message: string, status: number, source?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.source = source;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        source: this.source,
      },
    };
  }
}

export const isApiError = (value: unknown): value is ApiError => value instanceof ApiError;
