import type { WeatherSnapshot } from "@/lib/contracts";
import { Card, Grid, Label, SubValue, Value } from "./WeatherMetrics.styles";

export interface WeatherMetricsProps {
  snapshot: WeatherSnapshot;
}

export function WeatherMetrics({ snapshot }: WeatherMetricsProps) {
  const { temperature, wind, humidity } = snapshot;

  return (
    <Grid>
      <Card>
        <Label>Feels like</Label>
        <Value>
          {Math.round(temperature.feelsLike)}°{temperature.unit}
        </Value>
        <SubValue>Apparent temperature</SubValue>
      </Card>
      <Card>
        <Label>Min / Max</Label>
        <Value>
          {Math.round(temperature.min)}° / {Math.round(temperature.max)}°
        </Value>
        <SubValue>{temperature.unit === "F" ? "Fahrenheit" : "Celsius"} range</SubValue>
      </Card>
      <Card>
        <Label>Wind</Label>
        <Value>
          {wind.speed.toFixed(1)} <SubValue>{wind.unit}</SubValue>
        </Value>
        <SubValue>{describeWind(wind.speed, wind.unit)}</SubValue>
      </Card>
      <Card>
        <Label>Humidity</Label>
        <Value>{humidity}%</Value>
        <SubValue>{describeHumidity(humidity)}</SubValue>
      </Card>
    </Grid>
  );
}

function describeWind(speed: number, unit: "m/s" | "mph"): string {
  const mps = unit === "mph" ? speed * 0.44704 : speed;
  if (mps < 1.5) return "Calm";
  if (mps < 5.5) return "Light breeze";
  if (mps < 10.7) return "Moderate";
  if (mps < 17.1) return "Strong";
  return "Gale";
}

function describeHumidity(value: number): string {
  if (value < 30) return "Dry";
  if (value < 60) return "Comfortable";
  if (value < 80) return "Humid";
  return "Very humid";
}
