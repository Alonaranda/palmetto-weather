import { ApiError } from "./errors";

export type FetchLike = typeof fetch;

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
  fetchImpl?: FetchLike;
}

const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Raised by the http helper when the upstream returns a non-2xx response.
 * Callers map the upstream status to a domain ApiError — vendor-specific
 * status semantics do not belong in this helper.
 */
export class UpstreamHttpError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(status: number, bodyText: string) {
    super(`Upstream returned ${status}`);
    this.name = "UpstreamHttpError";
    this.status = status;
    this.bodyText = bodyText;
  }
}

/**
 * Thin wrapper around fetch that adds a timeout and surfaces structured
 * errors. Returns the parsed JSON body on success. Non-2xx responses are
 * raised as UpstreamHttpError; transport / timeout failures are raised as
 * ApiError so the BFF can return a predictable 5xx without leaking details.
 */
export async function getJson<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS, headers, fetchImpl = fetch } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      headers: { Accept: "application/json", ...headers },
      signal: controller.signal,
    });
  } catch (cause) {
    if ((cause as Error)?.name === "AbortError") {
      throw new ApiError("UPSTREAM_UNAVAILABLE", "Upstream request timed out", 504);
    }
    throw new ApiError(
      "UPSTREAM_UNAVAILABLE",
      `Network error: ${(cause as Error).message ?? "unknown"}`,
      503,
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new UpstreamHttpError(response.status, bodyText);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError("INVALID_RESPONSE", "Upstream returned non-JSON body", 502);
  }
}
