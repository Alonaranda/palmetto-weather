import type { PokemonCompanion as PokemonCompanionData } from "@/lib/contracts";
import Image from "next/image";
import {
  Card,
  Header,
  ImageWrap,
  Name,
  Placeholder,
  PokedexNumber,
  Reason,
  TYPE_COLORS,
  TypeBadge,
  TypeBadgeList,
} from "./PokemonCompanion.styles";

export interface PokemonCompanionProps {
  companion: PokemonCompanionData;
}

export function PokemonCompanion({ companion }: PokemonCompanionProps) {
  const palette = TYPE_COLORS[companion.type] ?? TYPE_COLORS.normal;

  return (
    <Card $bg={palette.bg} $fg={palette.fg}>
      <Header>
        <PokedexNumber>#{String(companion.pokedexNumber).padStart(4, "0")}</PokedexNumber>
        <TypeBadgeList>
          {companion.pokemonTypes.map((t) => (
            <TypeBadge key={t}>{t}</TypeBadge>
          ))}
        </TypeBadgeList>
      </Header>

      <ImageWrap>
        {companion.spriteUrl ? (
          <Image
            src={companion.spriteUrl}
            alt={`Sprite of ${companion.name}`}
            width={180}
            height={180}
            unoptimized
            priority
          />
        ) : (
          <Placeholder aria-hidden="true">?</Placeholder>
        )}
      </ImageWrap>

      <Name>{capitalize(companion.name)}</Name>
      <Reason>{companion.reason}</Reason>
    </Card>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
