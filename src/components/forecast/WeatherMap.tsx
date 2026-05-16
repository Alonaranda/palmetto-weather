import L from "leaflet";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { MapShell } from "./WeatherMap.styles";

/**
 * Bundler-friendly default icon — Leaflet's default lookup uses relative
 * URLs that break under Webpack / SWC, so we provide explicit module imports.
 */
L.Icon.Default.mergeOptions({
  iconUrl: (iconUrl as unknown as { src: string }).src ?? (iconUrl as unknown as string),
  iconRetinaUrl:
    (iconRetinaUrl as unknown as { src: string }).src ?? (iconRetinaUrl as unknown as string),
  shadowUrl: (shadowUrl as unknown as { src: string }).src ?? (shadowUrl as unknown as string),
});

export interface WeatherMapProps {
  lat: number;
  lon: number;
  label: string;
  zoom?: number;
}

export function WeatherMap({ lat, lon, label, zoom = 10 }: WeatherMapProps) {
  return (
    <MapShell aria-label={`Map of ${label}`}>
      <MapContainer center={[lat, lon]} zoom={zoom} scrollWheelZoom={false} attributionControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterOnChange lat={lat} lon={lon} zoom={zoom} />
        <Marker position={[lat, lon]}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </MapShell>
  );
}

/** Keeps the map centred when the parent passes new coordinates. */
function RecenterOnChange({ lat, lon, zoom }: { lat: number; lon: number; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], zoom);
  }, [map, lat, lon, zoom]);
  return null;
}

export default WeatherMap;
