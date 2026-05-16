import { WeatherMetrics } from "@/components/forecast/WeatherMetrics";
import { PokeWeatherShowcase } from "@/components/pokeweather/PokeWeatherShowcase";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { LocationSearch } from "@/components/shared/LocationSearch";
import { useWeather } from "@/hooks/useWeather";
import {
  ConditionDescription,
  ConditionLabel,
  ConditionRow,
  ConditionText,
  Details,
  DetailsTitle,
  Hero,
  LoadingMessage,
  Main,
  Subtitle,
  Tagline,
  Title,
} from "@/styles/pages/pokeweather.styles";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

export default function PokeWeather() {
  const { status, data, error, search } = useWeather();
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = (location: string) => {
    setLastQuery(location);
    void search(location);
  };

  return (
    <>
      <Head>
        <title>PokeWeather — Weather paired with a Pokémon</title>
        <meta
          name="description"
          content="Search any city and meet the Pokémon whose elemental type matches the current weather."
        />
      </Head>
      <Main>
        <Hero>
          <Tagline>PokeWeather</Tagline>
          <Title>The weather, as a Pokémon</Title>
          <Subtitle>
            Search any city to meet a Pokémon whose type matches the current conditions. Search
            again to roll a new partner.
          </Subtitle>
        </Hero>

        <LocationSearch onSearch={handleSearch} isLoading={status === "loading"} />

        {status === "loading" && !data ? <LoadingMessage>Loading weather…</LoadingMessage> : null}

        {status === "error" && error ? (
          <ErrorMessage
            code={error.code}
            message={error.message}
            onRetry={lastQuery ? () => handleSearch(lastQuery) : undefined}
          />
        ) : null}

        {data ? (
          <>
            <PokeWeatherShowcase weather={data.weather} companion={data.companion} />

            <Details>
              <DetailsTitle>Right now</DetailsTitle>
              <ConditionRow>
                <Image
                  src={data.weather.conditions.iconUrl}
                  alt={data.weather.conditions.description}
                  width={64}
                  height={64}
                  unoptimized
                />
                <ConditionText>
                  <ConditionLabel>Conditions</ConditionLabel>
                  <ConditionDescription>{data.weather.conditions.description}</ConditionDescription>
                </ConditionText>
              </ConditionRow>
              <WeatherMetrics snapshot={data.weather} />
            </Details>
          </>
        ) : null}
      </Main>
    </>
  );
}
