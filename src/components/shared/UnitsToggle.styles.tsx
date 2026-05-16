import styled, { css } from "styled-components";

export const Group = styled.div`
  display: inline-flex;
  padding: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.pill};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

export const Option = styled.button<{ $active: boolean }>`
  appearance: none;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.pill};
  color: ${({ theme }) => theme.colors.muted};
  transition: background 120ms ease, color 120ms ease;

  ${({ $active, theme }) =>
    $active &&
    css`
      background: ${theme.colors.accent};
      color: white;
    `}
`;
