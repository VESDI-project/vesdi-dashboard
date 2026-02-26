'use client';

import { useMemo, useEffect, useState } from 'react';
import { CircleMarker, Tooltip } from 'react-leaflet';
import { DynamicMap } from './dynamic-map';
import { Card } from '@/components/ui/card';

interface PC4BubbleData {
  pc4: string;
  count: number;
  weight: number;
}

interface Centroid {
  lat: number;
  lng: number;
}

interface PC4BubbleMapProps {
  title: string;
  data: PC4BubbleData[];
  color?: string;
  height?: number;
}

export function PC4BubbleMap({
  title,
  data,
  color = '#004D6E',
  height = 300,
}: PC4BubbleMapProps) {
  const [centroids, setCentroids] = useState<Record<string, Centroid>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/geo/pc4-centroids.json')
      .then((res) => res.json())
      .then((data: Record<string, Centroid>) => {
        setCentroids(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = useMemo(
    () => Math.max(...data.map((d) => d.count), 1),
    [data]
  );

  const mappedData = useMemo(
    () =>
      data
        .map((d) => {
          const centroid = centroids[d.pc4];
          if (!centroid) return null;
          return { ...d, lat: centroid.lat, lng: centroid.lng };
        })
        .filter(Boolean) as (PC4BubbleData & { lat: number; lng: number })[],
    [data, centroids]
  );

  // Auto-compute center from data
  const center = useMemo((): [number, number] => {
    if (mappedData.length === 0) return [52.09, 5.12];
    const avgLat = mappedData.reduce((s, d) => s + d.lat, 0) / mappedData.length;
    const avgLng = mappedData.reduce((s, d) => s + d.lng, 0) / mappedData.length;
    return [avgLat, avgLng];
  }, [mappedData]);

  if (loading) {
    return (
      <Card className="animate-pulse" style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-dmi-text/40">
          Kaart laden...
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-2">
      {title && <h3 className="text-sm font-semibold text-dmi-text px-2 mb-2">{title}</h3>}
      <DynamicMap center={center} zoom={11} height={height - 40}>
        {mappedData.map((d) => {
          const radius = Math.max(3, Math.sqrt(d.count / maxCount) * 20);
          return (
            <CircleMarker
              key={d.pc4}
              center={[d.lat, d.lng]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.6,
                color: color,
                weight: 1,
                opacity: 0.8,
              }}
            >
              <Tooltip sticky>
                <strong>PC4 {d.pc4}</strong>
                <br />
                Aantal: {d.count.toLocaleString('nl-NL')}
                <br />
                Gewicht: {d.weight.toLocaleString('nl-NL')} kg
              </Tooltip>
            </CircleMarker>
          );
        })}
      </DynamicMap>
    </Card>
  );
}
