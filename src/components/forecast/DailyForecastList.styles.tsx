import styled from "styled-components";

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const Heading = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const List = styled.ol`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing(2)};
  list-style: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
`;

export const Item = styled.li`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const DayLabel = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
`;

export const Day = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const DateText = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

export const ConditionRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Description = styled.span`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  color: ${({ theme }) => theme.colors.muted};
  text-transform: capitalize;
`;

export const TempRange = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

export const Details = styled.dl`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  color: ${({ theme }) => theme.colors.muted};
`;

export const DetailLabel = styled.dt`
  color: ${({ theme }) => theme.colors.muted};
`;

export const DetailValue = styled.dd`
  color: ${({ theme }) => theme.colors.foreground};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  text-align: right;
`;
