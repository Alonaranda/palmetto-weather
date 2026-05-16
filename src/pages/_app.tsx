import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Header } from "@/components/shared/Header";
import { GlobalStyle } from "@/styles/GlobalStyle";
import { theme } from "@/styles/theme";
import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Header />
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
