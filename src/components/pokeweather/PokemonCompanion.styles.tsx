import type { PokemonType } from "@/lib/services/pokeapi";
import styled from "styled-components";

/**
 * Color palette per Pokémon type — used to theme the companion card so the
 * pairing feels visually intentional, not just textual.
 */
export const TYPE_COLORS: Record<PokemonType, { bg: string; fg: string }> = {
  normal: { bg: "#e6e0d4", fg: "#3a3a3a" },
  fire: { bg: "#ffd7b2", fg: "#a8390e" },
  water: { bg: "#bcdcff", fg: "#0c4a8a" },
  electric: { bg: "#fff2ad", fg: "#7a5a00" },
  grass: { bg: "#c8ecb6", fg: "#2c6a1e" },
  ice: { bg: "#cdeef0", fg: "#0c5b65" },
  fighting: { bg: "#f5c1c1", fg: "#7c1e1e" },
  poison: { bg: "#d7bce0", fg: "#5d2078" },
  ground: { bg: "#ebd4a0", fg: "#6a4a10" },
  flying: { bg: "#d4dffd", fg: "#3a4a8a" },
  psychic: { bg: "#fbc9d8", fg: "#902c52" },
  bug: { bg: "#dde9a8", fg: "#506b14" },
  rock: { bg: "#d8c98f", fg: "#5f4a14" },
  ghost: { bg: "#cfc2e0", fg: "#3b2861" },
  dragon: { bg: "#c4b6f3", fg: "#3b2680" },
  dark: { bg: "#c4b3a1", fg: "#2a1f15" },
  steel: { bg: "#d9dde2", fg: "#3a4452" },
  fairy: { bg: "#fbd1de", fg: "#8a2a4d" },
};

export const Card = styled.aside<{ $bg: string; $fg: string }>`
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing(6)};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

export const PokedexNumber = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  opacity: 0.7;
`;

export const TypeBadgeList = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const TypeBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.45);
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
`;

export const ImageWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
`;

export const Placeholder = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.typography.sizes.xxl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const Name = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const Reason = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  text-align: center;
  opacity: 0.9;
`;
