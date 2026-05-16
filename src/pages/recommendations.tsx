import { EmailRecommendationsButton } from "@/components/recommendations/EmailRecommendationsButton";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { LocationSearch } from "@/components/shared/LocationSearch";
import { useForecastWithGeolocation } from "@/hooks/useForecastWithGeolocation";
import { generateRecommendations } from "@/lib/business/generateRecommendations";
import {
  FallbackBody,
  FallbackBox,
  FallbackTitle,
  Hero,
  Loading,
  LocationLine,
  LocationName,
  Main,
  Subtitle,
  Tagline,
  Title,
} from "@/styles/pages/recommendations.styles";
import Head from "next/head";
import { useMemo } from "react";

export default function Recommendations() {
  const { status, data, error, geoStatus, searchManually, showFallbackSearch } =
    useForecastWithGeolocation();

  const recommendations = useMemo(
    () =>
      data
        ? generateRecommendations(data.daily, {
            temperatureUnit: data.current.temperature.unit,
          })
        : [],
    [data],
  );

  return (
    <>
      <Head>
        <title>Recommendations — PalmettoWeather</title>
        <meta
          name="description"
          content="Personalised week-ahead recommendations: what to wear, when to bring an umbrella, when to pack sunscreen."
        />
      </Head>
      <Main>
        <Hero>
          <Tagline>Recommendations</Tagline>
          <Title>Thinking a few days ahead</Title>
          <Subtitle>
            Based on the next five days where you are, here is what to pack, when to bring an
            umbrella, when sunscreen will save your skin, and when to layer up.
          </Subtitle>
        </Hero>

        {showFallbackSearch ? (
          <FallbackBox>
            <FallbackTitle>
              {geoStatus === "denied"
                ? "Location permission denied"
                : geoStatus === "unavailable"
                  ? "We couldn't detect your location"
                  : "Search another location"}
            </FallbackTitle>
            <FallbackBody>
              {geoStatus === "denied" || geoStatus === "unavailable"
                ? "No problem — type a city to see its recommendations."
                : "Enter any city to see its week."}
            </FallbackBody>
            <LocationSearch onSearch={searchManually} isLoading={status === "loading"} />
          </FallbackBox>
        ) : null}

        {geoStatus === "prompting" && !data ? <Loading>Detecting your location…</Loading> : null}

        {status === "loading" && !data ? <Loading>Loading your recommendations…</Loading> : null}

        {status === "error" && error ? (
          <ErrorMessage code={error.code} message={error.message} />
        ) : null}

        {data ? (
          <>
            <LocationLine>
              Showing recommendations for{" "}
              <LocationName>
                {data.current.location.name}
                {data.current.location.country ? `, ${data.current.location.country}` : ""}
              </LocationName>
              .
            </LocationLine>
            <RecommendationsList days={recommendations} />
            <EmailRecommendationsButton disabled={status === "loading"} />
          </>
        ) : null}
      </Main>
    </>
  );
}
