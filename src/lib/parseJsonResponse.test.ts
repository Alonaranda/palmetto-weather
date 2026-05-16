import { describe, expect, it } from "vitest";
import { parseJsonResponse } from "./parseJsonResponse";

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

function htmlResponse(body: string, status = 500): Response {
  return new Response(body, { status, headers: { "Content-Type": "text/html" } });
}

describe("parseJsonResponse", () => {
  it("returns ok=true with the parsed body on a 2xx JSON response", async () => {
    const result = await parseJsonResponse<{ value: number }>(jsonResponse({ value: 42 }));
    expect(result).toEqual({ ok: true, data: { value: 42 } });
  });

  it("returns the structured error from the body on a 4xx JSON response", async () => {
    const response = jsonResponse(
      { error: { code: "LOCATION_NOT_FOUND", message: "nope" } },
      { status: 404 },
    );
    const result = await parseJsonResponse(response);
    expect(result).toEqual({
      ok: false,
      error: { code: "LOCATION_NOT_FOUND", message: "nope" },
    });
  });

  it("does NOT crash when the server returns an HTML 500 page", async () => {
    const result = await parseJsonResponse(htmlResponse("<pre>missing module</pre>"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INTERNAL_ERROR");
      expect(result.error.message).toContain("missing module");
    }
  });

  it("flags malformed JSON with INVALID_RESPONSE", async () => {
    const response = new Response("{not valid", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseJsonResponse(response);
    expect(result).toEqual({
      ok: false,
      error: { code: "INVALID_RESPONSE", message: "Server returned malformed JSON" },
    });
  });
});
