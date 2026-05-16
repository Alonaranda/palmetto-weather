import type { ApiErrorBody } from "./contracts";
import type { ApiErrorCode } from "./errors";

/**
 * Read a `fetch` Response that is expected to carry our JSON contract.
 * Returns either the parsed body or a typed error — never throws.
 *
 * In dev mode Next.js can return an HTML 500 page (e.g. when a module fails
 * to compile). Without this guard the caller would crash with
 * `Unexpected token '<'` from `response.json()`, which is opaque to users.
 */
export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: ApiErrorCode; message: string } };

export async function parseJsonResponse<T>(response: Response): Promise<ParseResult<T>> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    return {
      ok: false,
      error: {
        code: response.ok ? "INVALID_RESPONSE" : "INTERNAL_ERROR",
        message: text.trim().slice(0, 200) || `Server responded with ${response.status}`,
      },
    };
  }

  let body: T | ApiErrorBody;
  try {
    body = (await response.json()) as T | ApiErrorBody;
  } catch {
    return {
      ok: false,
      error: { code: "INVALID_RESPONSE", message: "Server returned malformed JSON" },
    };
  }

  if (!response.ok) {
    const err = (body as ApiErrorBody).error;
    if (err?.code && err?.message) {
      return { ok: false, error: { code: err.code, message: err.message } };
    }
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: `Server responded with ${response.status}` },
    };
  }

  return { ok: true, data: body as T };
}
