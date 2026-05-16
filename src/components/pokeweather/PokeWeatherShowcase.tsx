import type { PokemonCompanion, WeatherSnapshot } from "@/lib/contracts";
import Image from "next/image";
import {
  Copy,
  DescriptorChip,
  DescriptorList,
  Headline,
  PokedexLine,
  PokemonName,
  Reason,
  Showcase,
  SpriteWrap,
  TypeBadge,
  TypesRow,
} from "./PokeWeatherShowcase.styles";

export interface PokeWeatherShowcaseProps {
  weather: WeatherSnapshot;
  companion: PokemonCompanion;
}

export function PokeWeatherShowcase({ weather, companion }: PokeWeatherShowcaseProps) {
  const locationLabel = weather.location.country
    ? `${weather.location.name}, ${weather.location.country}`
    : weather.location.name;

  return (
    <Showcase $type={companion.type} aria-label={`${companion.name} pairing for ${locationLabel}`}>
      <SpriteWrap>
        {companion.spriteUrl ? (
          <Image
            src={companion.spriteUrl}
            alt={`Sprite of ${companion.name}`}
            width={220}
            height={220}
            unoptimized
            priority
          />
        ) : null}
      </SpriteWrap>
      <Copy>
        <Headline>
          The weather in {locationLabel} feels like <PokemonName>{companion.name}</PokemonName>.
        </Headline>
        <PokedexLine>#{String(companion.pokedexNumber).padStart(4, "0")}</PokedexLine>
        <DescriptorList aria-label="Weather descriptors">
          {companion.descriptors.map((tag) => (
            <DescriptorChip key={tag}>{tag}</DescriptorChip>
          ))}
        </DescriptorList>
        <TypesRow>
          Pokémon type
          {companion.pokemonTypes.map((t) => (
            <TypeBadge key={t}>{t}</TypeBadge>
          ))}
        </TypesRow>
        <Reason>{companion.reason}</Reason>
      </Copy>
    </Showcase>
  );
}
