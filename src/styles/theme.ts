export const theme = {
  colors: {
    foreground: "#0b1f3a",
    background: "#f5f7fb",
    surface: "#ffffff",
    accent: "#1d8a4b",
    accentSoft: "#e6f4ec",
    muted: "#5b6b80",
    border: "#dde3ee",
    danger: "#c0392b",
    dangerSoft: "#fdecea",
  },
  radii: {
    sm: "6px",
    md: "12px",
    lg: "20px",
    pill: "999px",
  },
  spacing: (n: number) => `${n * 4}px`,
  shadows: {
    sm: "0 1px 2px rgba(11, 31, 58, 0.06)",
    md: "0 6px 20px rgba(11, 31, 58, 0.08)",
    lg: "0 20px 40px rgba(11, 31, 58, 0.12)",
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    sizes: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "20px",
      xl: "28px",
      xxl: "40px",
    },
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
  },
} as const;

export type AppTheme = typeof theme;
