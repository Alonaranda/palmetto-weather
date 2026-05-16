import styled from "styled-components";

export const MapShell = styled.div`
  width: 100%;
  height: 320px;
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};

  .leaflet-container {
    width: 100%;
    height: 100%;
  }
`;
