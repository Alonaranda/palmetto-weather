import styled from "styled-components";

export const Wrapper = styled.div`
  max-width: 720px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(5)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: flex-start;
`;

export const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.weights.bold};
`;

export const Body = styled.p`
  font-size: ${({ theme }) => theme.typography.sizes.md};
  color: ${({ theme }) => theme.colors.muted};
`;

export const Detail = styled.code`
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.muted};
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 100%;
`;

export const ReloadButton = styled.button`
  appearance: none;
  border: none;
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.sizes.md};
  font-weight: ${({ theme }) => theme.typography.weights.medium};
  color: white;
  background: ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(5)};
  border-radius: ${({ theme }) => theme.radii.md};

  &:hover {
    opacity: 0.92;
  }
`;
