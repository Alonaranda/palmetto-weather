import type { DayRecommendation } from "@/lib/business/generateRecommendations";
import {
  Card,
  DateText,
  DayLabel,
  DayRow,
  Heading,
  Headline,
  Item,
  ItemIcon,
  ItemLabel,
  ItemReason,
  ItemText,
  Items,
  List,
  Section,
} from "./RecommendationsList.styles";

export interface RecommendationsListProps {
  days: DayRecommendation[];
}

export function RecommendationsList({ days }: RecommendationsListProps) {
  return (
    <Section aria-label="Daily recommendations">
      <Heading>Plan ahead — your week at a glance</Heading>
      <List>
        {days.map((day) => (
          <Card key={day.date}>
            <DayRow>
              <DayLabel>{day.dayLabel}</DayLabel>
              <DateText>{formatShortDate(day.date)}</DateText>
            </DayRow>
            <Headline>{day.headline}</Headline>
            <Items>
              {day.items.map((item) => (
                <Item key={item.id}>
                  <ItemIcon aria-hidden="true">{item.icon}</ItemIcon>
                  <ItemText>
                    <ItemLabel>{item.label}</ItemLabel>
                    <ItemReason>{item.reason}</ItemReason>
                  </ItemText>
                </Item>
              ))}
            </Items>
          </Card>
        ))}
      </List>
    </Section>
  );
}

function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
