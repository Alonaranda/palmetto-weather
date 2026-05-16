import { type ChangeEvent, type FormEvent, useState } from "react";
import { Form, Input, Label, Row, SubmitButton } from "./LocationSearch.styles";

export interface LocationSearchProps {
  onSearch: (location: string) => void;
  isLoading?: boolean;
  initialValue?: string;
}

export function LocationSearch({
  onSearch,
  isLoading = false,
  initialValue = "",
}: LocationSearchProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSearch(trimmed);
  };

  return (
    <Form onSubmit={handleSubmit} aria-label="Search weather by location">
      <Label htmlFor="location-input">Location</Label>
      <Row>
        <Input
          id="location-input"
          name="location"
          type="text"
          placeholder="Try Bogotá, London, or 10001,us"
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
          autoComplete="off"
          aria-busy={isLoading}
          disabled={isLoading}
        />
        <SubmitButton type="submit" disabled={!value.trim() || isLoading}>
          {isLoading ? "Searching…" : "Search"}
        </SubmitButton>
      </Row>
    </Form>
  );
}
