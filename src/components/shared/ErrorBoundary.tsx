import { Component, type ErrorInfo, type ReactNode } from "react";
import { Body, Detail, ReloadButton, Title, Wrapper } from "./ErrorBoundary.styles";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional override for the fallback UI. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time exceptions anywhere below it so the user sees a
 * friendly fallback instead of a blank page or Next's red overlay in dev.
 * Error boundaries must be class components — there is no hook equivalent.
 *
 * Production note: replace the `console.error` with a structured logger
 * (Sentry/Datadog) so this branch becomes alertable.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[ErrorBoundary] caught error", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback(error, this.handleReset);
    }

    return (
      <Wrapper aria-live="assertive">
        <Title>Something went wrong</Title>
        <Body>
          We hit an unexpected issue rendering this page. The error has been logged. You can try
          again, or reload the page if it persists.
        </Body>
        <Detail>{error.message}</Detail>
        <ReloadButton type="button" onClick={this.handleReset}>
          Try again
        </ReloadButton>
      </Wrapper>
    );
  }
}
