'use client';

import { useMemo } from 'react';
import { GeoJSON, Tooltip } from 'react-leaflet';
import { DynamicMap } from './dynamic-map';
import { useGeoJSON } from '@/hooks/use-geojson';
import { CHOROPLETH_TEAL, CHOROPLETH_MAUVE } from '@/lib/colors';
import { Card } from '@/components/ui/card';
import type { Nuts3Data } from '@/lib/types';
import type { Feature, Geometry } from 'geojson';
import type { Layer, PathOptions } from 'leaflet';

interface Nuts3ChoroplethProps {
  data: Nuts3Data[];
  colorScale?: 'teal' | 'mauve';
  height?: number;
}

export function Nuts3Choropleth({
  data,
  colorScale = 'teal',
  height = 400,
}: Nuts3ChoroplethProps) {
  const { data: geojson, loading } = useGeoJSON('/geo/nuts3-europe.json');
  const colors = colorScale === 'teal' ? CHOROPLETH_TEAL : CHOROPLETH_MAUVE;

  const dataMap = useMemo(() => {
    const map = new Map<string, Nuts3Data>();
    for (const d of data) {
      map.set(d.nuts3, d);
    }
    return map;
  }, [data]);

  const maxPct = useMemo(
    () => Math.max(...data.map((d) => d.percentage), 0.01),
    [data]
  );

  const getColor = (pct: number) => {
    if (pct === 0) return '#f0f0f0';
    const idx = Math.min(
      Math.floor((pct / maxPct) * (colors.length - 1)),
      colors.length - 1
    );
    return colors[idx];
  };

  const style = (feature?: Feature<Geometry> | undefined): PathOptions => {
    const nuts3Id = feature?.properties?.NUTS_ID || '';
    const d = dataMap.get(nuts3Id);
    return {
      fillColor: d ? getColor(d.percentage) : '#f0f0f0',
      weight: 0.5,
      opacity: 1,
      color: '#ccc',
      fillOpacity: d ? 0.8 : 0.2,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const nuts3Id = feature.properties?.NUTS_ID || '';
    const name = feature.properties?.NUTS_NAME || nuts3Id;
    const d = dataMap.get(nuts3Id);
    if (d) {
      layer.bindTooltip(
        `${name}: ${d.count.toLocaleString('nl-NL')} (${(d.percentage * 100).toFixed(1)}%)`,
        { sticky: true }
      );
    }
  };

  if (loading || !geojson) {
    return (
      <Card className="animate-pulse bg-white/5" style={{ height }}>
        <div className="flex items-center justify-center h-full text-sm text-dmi-text/40">
          Kaart laden...
        </div>
      </Card>
    );
  }

  return (
    <DynamicMap center={[50, 8]} zoom={4} height={height}>
      <GeoJSON
        data={geojson}
        style={style}
        onEachFeature={onEachFeature}
      />
    </DynamicMap>
  );
}
