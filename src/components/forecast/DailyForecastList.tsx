import type { DailyForecast } from "@/lib/business/groupForecastByDay";
import Image from "next/image";
import {
  ConditionRow,
  DateText as DateLabel,
  Day,
  DayLabel,
  Description,
  DetailLabel,
  DetailValue,
  Details,
  Heading,
  Item,
  List,
  Section,
  TempRange,
} from "./DailyForecastList.styles";

export interface DailyForecastListProps {
  days: DailyForecast[];
  unit: "C" | "F";
  windUnit: "m/s" | "mph";
}

export function DailyForecastList({ days, unit, windUnit }: DailyForecastListProps) {
  return (
    <Section aria-label="Daily forecast">
      <Heading>5-day forecast</Heading>
      <List>
        {days.map((day) => (
          <Item key={day.date}>
            <DayLabel>
              <Day>{day.dayLabel}</Day>
              <DateLabel>{formatShortDate(day.date)}</DateLabel>
            </DayLabel>
            <ConditionRow>
              <Image
                src={day.condition.iconUrl}
                alt={day.condition.description}
                width={48}
                height={48}
                unoptimized
              />
              <Description>{day.condition.description}</Description>
            </ConditionRow>
            <TempRange>
              {Math.round(day.temperature.max)}° / {Math.round(day.temperature.min)}°{unit}
            </TempRange>
            <Details>
              <DetailLabel>Rain chance</DetailLabel>
              <DetailValue>{Math.round(day.precipitation.probability * 100)}%</DetailValue>
              {day.precipitation.rainMm > 0 ? (
                <>
                  <DetailLabel>Rain</DetailLabel>
                  <DetailValue>{day.precipitation.rainMm.toFixed(1)} mm</DetailValue>
                </>
              ) : null}
              {day.precipitation.snowMm > 0 ? (
                <>
                  <DetailLabel>Snow</DetailLabel>
                  <DetailValue>{day.precipitation.snowMm.toFixed(1)} mm</DetailValue>
                </>
              ) : null}
              <DetailLabel>Max wind</DetailLabel>
              <DetailValue>
                {day.wind.maxSpeed.toFixed(1)} {windUnit}
              </DetailValue>
              <DetailLabel>Humidity</DetailLabel>
              <DetailValue>{day.humidityAverage}%</DetailValue>
              <DetailLabel>Pressure</DetailLabel>
              <DetailValue>{day.pressureAverage} hPa</DetailValue>
            </Details>
          </Item>
        ))}
      </List>
    </Section>
  );
}

function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
