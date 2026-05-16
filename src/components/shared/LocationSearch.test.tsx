import { theme } from "@/styles/theme";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { ThemeProvider } from "styled-components";
import { describe, expect, it, vi } from "vitest";
import { LocationSearch } from "./LocationSearch";

function renderWithTheme(ui: ReactElement) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe("<LocationSearch />", () => {
  it("calls onSearch with the trimmed value when submitted", async () => {
    const onSearch = vi.fn();
    renderWithTheme(<LocationSearch onSearch={onSearch} />);

    const input = screen.getByLabelText("Location");
    await userEvent.type(input, "  Bogotá  ");
    await userEvent.click(screen.getByRole("button", { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith("Bogotá");
  });

  it("does not submit when the input is empty", async () => {
    const onSearch = vi.fn();
    renderWithTheme(<LocationSearch onSearch={onSearch} />);

    const submit = screen.getByRole("button", { name: /search/i });
    expect(submit).toBeDisabled();
    await userEvent.click(submit);
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("disables the input and button while loading", () => {
    renderWithTheme(<LocationSearch onSearch={vi.fn()} isLoading />);
    expect(screen.getByLabelText("Location")).toBeDisabled();
    expect(screen.getByRole("button", { name: /searching/i })).toBeDisabled();
  });
});
