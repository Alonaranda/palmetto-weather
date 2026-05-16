import Link from "next/link";
import styled, { css } from "styled-components";

export const HeaderBar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(5)};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Brand = styled(Link)`
  font-size: ${({ theme }) => theme.typography.sizes.lg};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
  color: ${({ theme }) => theme.colors.foreground};
  letter-spacing: -0.01em;
`;

export const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const NavLink = styled(Link)<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: background 120ms ease, color 120ms ease;

  ${({ $active, theme }) =>
    $active
      ? css`
          background: ${theme.colors.accentSoft};
          color: ${theme.colors.accent};
        `
      : css`
          color: ${theme.colors.muted};
          &:hover {
            background: ${theme.colors.background};
            color: ${theme.colors.foreground};
          }
        `}
`;
