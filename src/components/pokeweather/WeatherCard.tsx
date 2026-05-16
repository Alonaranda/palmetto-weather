import type { WeatherSnapshot } from "@/lib/contracts";
import Image from "next/image";
import {
  Card,
  ConditionIcon,
  ConditionLabel,
  CountryBadge,
  CurrentTemp,
  Header,
  LocationName,
  Metric,
  MetricLabel,
  MetricValue,
  Metrics,
  ObservedAt,
  Temperature,
} from "./WeatherCard.styles";

export interface WeatherCardProps {
  snapshot: WeatherSnapshot;
}

export function WeatherCard({ snapshot }: WeatherCardProps) {
  const { location, conditions, temperature, wind, humidity, observedAt } = snapshot;
  const observed = new Date(observedAt);

  return (
    <Card>
      <Header>
        <div>
          <LocationName>
            {location.name}
            {location.country ? <CountryBadge>{location.country}</CountryBadge> : null}
          </LocationName>
          <ObservedAt dateTime={observedAt}>Observed {observed.toLocaleString()}</ObservedAt>
        </div>
        <ConditionIcon>
          <Image
            src={conditions.iconUrl}
            alt={conditions.description}
            width={80}
            height={80}
            unoptimized
          />
        </ConditionIcon>
      </Header>

      <Temperature>
        <CurrentTemp>
          {Math.round(temperature.current)}°{temperature.unit}
        </CurrentTemp>
        <ConditionLabel>{capitalize(conditions.description)}</ConditionLabel>
      </Temperature>

      <Metrics>
        <Metric>
          <MetricLabel>Feels like</MetricLabel>
          <MetricValue>
            {Math.round(temperature.feelsLike)}°{temperature.unit}
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Min / Max</MetricLabel>
          <MetricValue>
            {Math.round(temperature.min)}° / {Math.round(temperature.max)}°
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Wind</MetricLabel>
          <MetricValue>
            {wind.speed.toFixed(1)} {wind.unit}
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Humidity</MetricLabel>
          <MetricValue>{humidity}%</MetricValue>
        </Metric>
      </Metrics>
    </Card>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
