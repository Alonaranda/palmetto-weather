import type { WeatherSnapshot } from "@/lib/contracts";
import Image from "next/image";
import {
  ConditionLabel,
  CountryBadge,
  Hero,
  IconWrap,
  Identity,
  LocationLabel,
  ObservedAt,
  Temp,
  TempRow,
  TempUnit,
} from "./CurrentWeatherHero.styles";

export interface CurrentWeatherHeroProps {
  snapshot: WeatherSnapshot;
}

export function CurrentWeatherHero({ snapshot }: CurrentWeatherHeroProps) {
  const { location, conditions, temperature, observedAt } = snapshot;
  const observed = new Date(observedAt);

  return (
    <Hero>
      <Identity>
        <LocationLabel>
          {location.name}
          {location.country ? <CountryBadge>{location.country}</CountryBadge> : null}
        </LocationLabel>
        <ObservedAt dateTime={observedAt}>Observed {observed.toLocaleString()}</ObservedAt>
        <TempRow>
          <Temp>{Math.round(temperature.current)}°</Temp>
          <TempUnit>{temperature.unit}</TempUnit>
        </TempRow>
        <ConditionLabel>{conditions.description}</ConditionLabel>
      </Identity>
      <IconWrap>
        <Image
          src={conditions.iconUrl}
          alt={conditions.description}
          width={140}
          height={140}
          unoptimized
          priority
        />
      </IconWrap>
    </Hero>
  );
}
