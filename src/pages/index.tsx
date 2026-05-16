import { CurrentWeatherHero } from "@/components/forecast/CurrentWeatherHero";
import { DailyForecastList } from "@/components/forecast/DailyForecastList";
import { WeatherMetrics } from "@/components/forecast/WeatherMetrics";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { LocationSearch } from "@/components/shared/LocationSearch";
import { UnitsToggle } from "@/components/shared/UnitsToggle";
import { useForecastWithGeolocation } from "@/hooks/useForecastWithGeolocation";
import {
  FallbackBody,
  FallbackBox,
  FallbackTitle,
  Grid,
  Hero,
  LeftColumn,
  Loading,
  Main,
  RightColumn,
  Tagline,
  Title,
  TopBar,
} from "@/styles/pages/index.styles";
import dynamic from "next/dynamic";
import Head from "next/head";

/**
 * The map relies on `window`, so it can't be rendered server-side.
 * `next/dynamic` lazy-loads it on the client only.
 */
const WeatherMap = dynamic(() => import("@/components/forecast/WeatherMap"), {
  ssr: false,
  loading: () => <Loading>Loading map…</Loading>,
});

export default function Home() {
  const { status, data, error, geoStatus, units, setUnits, searchManually, showFallbackSearch } =
    useForecastWithGeolocation();

  return (
    <>
      <Head>
        <title>PalmettoWeather — Local weather + 5-day forecast</title>
        <meta
          name="description"
          content="Your location's current weather, daily forecast and map — all in one place."
        />
      </Head>
      <Main>
        <Hero>
          <TopBar>
            <div>
              <Tagline>Weather</Tagline>
              <Title>Your local forecast at a glance</Title>
            </div>
            <UnitsToggle value={units} onChange={setUnits} disabled={status === "loading"} />
          </TopBar>
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
                ? "No problem — type a city to see the forecast."
                : "Enter any city to see its forecast."}
            </FallbackBody>
            <LocationSearch onSearch={searchManually} isLoading={status === "loading"} />
          </FallbackBox>
        ) : null}

        {geoStatus === "prompting" && !data ? <Loading>Detecting your location…</Loading> : null}

        {status === "loading" && !data ? <Loading>Loading forecast…</Loading> : null}

        {status === "error" && error ? (
          <ErrorMessage code={error.code} message={error.message} />
        ) : null}

        {data ? (
          <>
            <CurrentWeatherHero snapshot={data.current} />
            <Grid>
              <LeftColumn>
                <DailyForecastList
                  days={data.daily}
                  unit={data.current.temperature.unit}
                  windUnit={data.current.wind.unit}
                />
              </LeftColumn>
              <RightColumn>
                <WeatherMetrics snapshot={data.current} />
                <WeatherMap
                  lat={data.current.location.coordinates.lat}
                  lon={data.current.location.coordinates.lon}
                  label={data.current.location.name}
                />
              </RightColumn>
            </Grid>
          </>
        ) : null}
      </Main>
    </>
  );
}
