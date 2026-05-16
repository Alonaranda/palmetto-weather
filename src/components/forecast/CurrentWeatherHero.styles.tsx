import styled from "styled-components";

export const Hero = styled.section`
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.accent} 0%,
    #134e8a 100%
  );
  color: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: ${({ theme }) => theme.spacing(7)} ${({ theme }) => theme.spacing(6)};
  display: grid;
  gap: ${({ theme }) => theme.spacing(5)};
  grid-template-columns: 1fr;
  align-items: center;
  box-shadow: ${({ theme }) => theme.shadows.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr auto;
  }
`;

export const Identity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const LocationLabel = styled.h2`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const CountryBadge = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  background: rgba(255, 255, 255, 0.18);
  color: white;
  padding: 2px ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radii.pill};
  letter-spacing: 0.05em;
`;

export const ObservedAt = styled.time`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  opacity: 0.85;
`;

export const TempRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Temp = styled.span`
  font-size: 64px;
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  line-height: 1;
`;

export const TempUnit = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  opacity: 0.85;
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const ConditionLabel = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  text-transform: capitalize;
  opacity: 0.95;
`;

export const IconWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
`;
