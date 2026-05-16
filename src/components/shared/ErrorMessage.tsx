import type { ApiErrorCode } from "@/lib/errors";
import { Banner, Body, Detail, RetryButton, Title } from "./ErrorMessage.styles";

export interface ErrorMessageProps {
  code: ApiErrorCode;
  message: string;
  onRetry?: () => void;
}

/**
 * Maps a domain error code to a user-facing message. Keeping this mapping
 * here (not in the hook or service) means the UI controls how technical
 * errors are translated to human-readable copy.
 */
const COPY_BY_CODE: Record<ApiErrorCode, { title: string; body: string }> = {
  LOCATION_NOT_FOUND: {
    title: "We couldn't find that place",
    body: "Try a different spelling, add a country code (e.g. London,uk), or try a nearby city.",
  },
  INVALID_API_KEY: {
    title: "The weather service rejected our key",
    body: "If you just generated your OpenWeather API key, it can take up to two hours to activate.",
  },
  RATE_LIMITED: {
    title: "Too many requests",
    body: "We've hit the free-tier rate limit. Please try again in a moment.",
  },
  UPSTREAM_UNAVAILABLE: {
    title: "The weather service is unreachable",
    body: "An upstream provider is timing out. Please try again in a few seconds.",
  },
  INVALID_RESPONSE: {
    title: "Unexpected response from the weather service",
    body: "We received data we couldn't understand. Please try again.",
  },
  BAD_REQUEST: {
    title: "Please enter a location",
    body: "Type a city, postcode, or 'city,country' combination and search again.",
  },
  INTERNAL_ERROR: {
    title: "Something went wrong on our side",
    body: "Please try again. If the problem persists, contact support.",
  },
};

export function ErrorMessage({ code, message, onRetry }: ErrorMessageProps) {
  const copy = COPY_BY_CODE[code] ?? COPY_BY_CODE.INTERNAL_ERROR;

  return (
    <Banner role="alert">
      <Title>{copy.title}</Title>
      <Body>{copy.body}</Body>
      <Detail>{message}</Detail>
      {onRetry ? (
        <RetryButton type="button" onClick={onRetry}>
          Try again
        </RetryButton>
      ) : null}
    </Banner>
  );
}
