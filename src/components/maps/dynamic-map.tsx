'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface DynamicMapProps {
  center?: [number, number];
  zoom?: number;
  height?: number;
  children?: React.ReactNode;
}

export function DynamicMap({
  center = [52.09, 5.12], // Utrecht default
  zoom = 7,
  height = 400,
  children,
}: DynamicMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '0.5rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {children}
    </MapContainer>
  );
}
