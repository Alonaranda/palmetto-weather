import type { ForecastUnits } from "@/hooks/useForecast";
import { Group, Option } from "./UnitsToggle.styles";

export interface UnitsToggleProps {
  value: ForecastUnits;
  onChange: (next: ForecastUnits) => void;
  disabled?: boolean;
}

export function UnitsToggle({ value, onChange, disabled = false }: UnitsToggleProps) {
  return (
    <Group aria-label="Temperature units">
      <Option
        type="button"
        $active={value === "metric"}
        onClick={() => onChange("metric")}
        aria-pressed={value === "metric"}
        disabled={disabled}
      >
        °C
      </Option>
      <Option
        type="button"
        $active={value === "imperial"}
        onClick={() => onChange("imperial")}
        aria-pressed={value === "imperial"}
        disabled={disabled}
      >
        °F
      </Option>
    </Group>
  );
}
