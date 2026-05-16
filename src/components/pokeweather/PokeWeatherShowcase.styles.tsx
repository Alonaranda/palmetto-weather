import type { PokemonType } from "@/lib/services/pokeapi";
import styled from "styled-components";
import { TYPE_COLORS } from "./PokemonCompanion.styles";

interface ShowcaseProps {
  $type: PokemonType;
}

export const Showcase = styled.section<ShowcaseProps>`
  background: linear-gradient(
    135deg,
    ${({ $type }: ShowcaseProps) => (TYPE_COLORS[$type] ?? TYPE_COLORS.normal).bg} 0%,
    rgba(255, 255, 255, 0.6) 100%
  );
  color: ${({ $type }: ShowcaseProps) => (TYPE_COLORS[$type] ?? TYPE_COLORS.normal).fg};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(7)} ${({ theme }) => theme.spacing(6)};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing(5)};
  align-items: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: auto 1fr;
  }
`;

export const SpriteWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 220px;
  margin: 0 auto;
  filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.18));
`;

export const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Headline = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  line-height: 1.35;
`;

export const PokemonName = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  text-transform: capitalize;
`;

export const PokedexLine = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  opacity: 0.7;
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

export const DescriptorList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(2)};
  list-style: none;
`;

export const DescriptorChip = styled.li`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: rgba(255, 255, 255, 0.6);
  padding: 4px ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.pill};
  text-transform: capitalize;
`;

export const TypesRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const TypeBadge = styled.span`
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: rgba(0, 0, 0, 0.12);
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
`;

export const Reason = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  opacity: 0.85;
`;
