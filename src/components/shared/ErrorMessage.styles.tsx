import styled from "styled-components";

export const Banner = styled.div`
  background: ${({ theme }) => theme.colors.dangerSoft};
  color: ${({ theme }) => theme.colors.danger};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: ${({ theme }) => theme.spacing(4)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const Body = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

export const Detail = styled.code`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  opacity: 0.75;
`;

export const RetryButton = styled.button`
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.danger};
  cursor: pointer;
`;
