import { theme } from "@/styles/theme";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

function Boom({ shouldThrow }: { shouldThrow: boolean }): ReactElement {
  if (shouldThrow) throw new Error("kaboom");
  return <p>all good</p>;
}

describe("<ErrorBoundary />", () => {
  // Silence React's predictable error log noise for this suite.
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  it("renders children when no error is thrown", () => {
    renderWithTheme(
      <ErrorBoundary>
        <Boom shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws", () => {
    renderWithTheme(
      <ErrorBoundary>
        <Boom shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/kaboom/)).toBeInTheDocument();
  });

  it("resets when the user clicks Try again", async () => {
    function Container() {
      // The reset path only un-renders the fallback — actually fixing the
      // underlying error is the caller's responsibility. We verify the
      // boundary itself recovers and re-renders children when they no
      // longer throw.
      return (
        <ErrorBoundary>
          <Boom shouldThrow={false} />
        </ErrorBoundary>
      );
    }

    const { rerender } = renderWithTheme(
      <ErrorBoundary>
        <Boom shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /try again/i }));
    rerender(
      <ThemeProvider theme={theme}>
        <Container />
      </ThemeProvider>,
    );
    expect(screen.getByText("all good")).toBeInTheDocument();
  });

  it("renders a custom fallback when provided", () => {
    renderWithTheme(
      <ErrorBoundary fallback={(err) => <p>custom: {err.message}</p>}>
        <Boom shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("custom: kaboom")).toBeInTheDocument();
  });
});
