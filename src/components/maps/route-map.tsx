'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { Polyline, Popup, Tooltip } from 'react-leaflet';
import { DynamicMap } from './dynamic-map';
import { useVesdiStore } from '@/lib/store';
import { ROUTE_HEAT_COLORS } from '@/lib/colors';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const ORS_BASE_URL = process.env.NEXT_PUBLIC_ORS_BASE_URL || 'https://api.openrouteservice.org';
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || '';

interface RouteSegment {
  coordinates: [number, number][];
  count: number;
  color: string;
  euro6Count: number;
  euro05Count: number;
  topKlassen: { klasse: string; count: number; pct: number }[];
}

interface Centroid {
  lat: number;
  lng: number;
}

interface PC4PairAgg {
  laadPC4: string;
  losPC4: string;
  count: number;
  euro6Count: number;
  euro05Count: number;
  klasseMap: Map<string, number>;
}

function getHeatColor(count: number, maxCount: number): string {
  if (maxCount === 0) return ROUTE_HEAT_COLORS[0];
  const ratio = count / maxCount;
  const idx = Math.min(
    Math.floor(ratio * (ROUTE_HEAT_COLORS.length - 1)),
    ROUTE_HEAT_COLORS.length - 1
  );
  return ROUTE_HEAT_COLORS[idx];
}

/** Build dynamic legend buckets from actual data range */
export function buildLegendBuckets(maxCount: number): { min: number; max: number | null; color: string }[] {
  if (maxCount === 0) return [{ min: 0, max: null, color: ROUTE_HEAT_COLORS[0] }];
  const step = Math.ceil(maxCount / ROUTE_HEAT_COLORS.length);
  return ROUTE_HEAT_COLORS.map((color, i) => {
    const min = i * step;
    const max = i === ROUTE_HEAT_COLORS.length - 1 ? null : (i + 1) * step - 1;
    return { min, max, color };
  }).reverse();
}

const CACHE_KEY = 'vesdi-routes-cache';

function getRouteCache(): Record<string, [number, number][]> {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function setRouteCache(cache: Record<string, [number, number][]>) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable
  }
}

async function fetchRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<[number, number][] | null> {
  const cacheKey = `${fromLat.toFixed(4)},${fromLng.toFixed(4)}-${toLat.toFixed(4)},${toLng.toFixed(4)}`;
  const cache = getRouteCache();
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const res = await fetch(`${ORS_BASE_URL}/v2/directions/driving-hgv/geojson`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: ORS_API_KEY,
      },
      body: JSON.stringify({
        coordinates: [
          [fromLng, fromLat],
          [toLng, toLat],
        ],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const coords: [number, number][] =
      data.features?.[0]?.geometry?.coordinates?.map(
        (c: [number, number]) => [c[1], c[0]] as [number, number]
      ) || [];

    if (coords.length > 0) {
      cache[cacheKey] = coords;
      setRouteCache(cache);
    }

    return coords;
  } catch {
    return null;
  }
}

interface RouteMapProps {
  height?: number;
  onLegendData?: (maxCount: number) => void;
}

export function RouteMap({ height = 500, onLegendData }: RouteMapProps) {
  const deelrittenByYear = useVesdiStore((s) => s.deelrittenByYear);
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Aggregate unique PC4 pairs across all years with Euro + klasse breakdown
  const pc4Pairs = useMemo((): PC4PairAgg[] => {
    const map = new Map<string, PC4PairAgg>();
    for (const rows of deelrittenByYear.values()) {
      for (const r of rows) {
        if (!r.isNational) continue;
        const laad = r.PC4LaadNL;
        const los = r.PC4LosNL;
        if (!laad || !los || laad === los) continue;
        const key = `${laad}-${los}`;
        let agg = map.get(key);
        if (!agg) {
          agg = { laadPC4: laad, losPC4: los, count: 0, euro6Count: 0, euro05Count: 0, klasseMap: new Map() };
          map.set(key, agg);
        }
        agg.count += r.aantalDeelritten;
        if (r.euronormKlasse === '6') {
          agg.euro6Count += r.aantalDeelritten;
        } else {
          agg.euro05Count += r.aantalDeelritten;
        }
        const klasse = r.stadslogistieke_klasse || `Klasse ${r.stadslogistieke_klasse_code}`;
        agg.klasseMap.set(klasse, (agg.klasseMap.get(klasse) || 0) + r.aantalDeelritten);
      }
    }
    return [...map.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 200);
  }, [deelrittenByYear]);

  const fetchRoutes = useCallback(async () => {
    if (pc4Pairs.length === 0) {
      setLoading(false);
      return;
    }

    let centroidMap: Record<string, Centroid>;
    try {
      const res = await fetch('/geo/pc4-centroids.json');
      centroidMap = await res.json();
    } catch {
      setLoading(false);
      return;
    }

    const maxCount = Math.max(...pc4Pairs.map((p) => p.count));
    onLegendData?.(maxCount);
    const results: RouteSegment[] = [];
    setProgress({ done: 0, total: pc4Pairs.length });

    for (let i = 0; i < pc4Pairs.length; i++) {
      const pair = pc4Pairs[i];
      const from = centroidMap[pair.laadPC4];
      const to = centroidMap[pair.losPC4];

      if (!from || !to) continue;

      let coords: [number, number][] | null = null;

      if (ORS_API_KEY) {
        coords = await fetchRoute(from.lat, from.lng, to.lat, to.lng);
        if (i > 0 && i % 35 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 60000));
        }
      }

      if (!coords || coords.length === 0) {
        coords = [
          [from.lat, from.lng],
          [to.lat, to.lng],
        ];
      }

      // Top 3 klassen
      const topKlassen = [...pair.klasseMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([klasse, count]) => ({
          klasse,
          count,
          pct: pair.count > 0 ? Math.round((count / pair.count) * 100) : 0,
        }));

      results.push({
        coordinates: coords,
        count: pair.count,
        color: getHeatColor(pair.count, maxCount),
        euro6Count: pair.euro6Count,
        euro05Count: pair.euro05Count,
        topKlassen,
      });

      setProgress({ done: i + 1, total: pc4Pairs.length });
    }

    results.sort((a, b) => a.count - b.count);
    setSegments(results);
    setLoading(false);
  }, [pc4Pairs, onLegendData]);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  if (loading) {
    return (
      <Card className="flex flex-col items-center justify-center" style={{ height }}>
        <Loader2 className="w-8 h-8 text-dmi-orange animate-spin mb-3" />
        <p className="text-sm text-dmi-text/60">
          Routes berekenen... {progress.done}/{progress.total}
        </p>
      </Card>
    );
  }

  const allCoords = segments.flatMap((s) => s.coordinates);
  const center: [number, number] =
    allCoords.length > 0
      ? [
          allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length,
          allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length,
        ]
      : [52.09, 5.12];

  return (
    <DynamicMap center={center} zoom={12} height={height}>
      {segments.map((seg, i) => {
        const euro6Pct = seg.count > 0 ? Math.round((seg.euro6Count / seg.count) * 100) : 0;
        const euro05Pct = 100 - euro6Pct;
        return (
          <Polyline
            key={i}
            positions={seg.coordinates}
            pathOptions={{
              color: seg.color,
              weight: 3,
              opacity: 0.8,
              lineJoin: 'round',
              lineCap: 'round',
            }}
          >
            <Tooltip sticky>
              {seg.count.toLocaleString('nl-NL')} deelritten
            </Tooltip>
            <Popup>
              <div className="text-xs min-w-[180px]">
                <p className="font-bold text-sm mb-2">
                  {seg.count.toLocaleString('nl-NL')} deelritten
                </p>
                <p className="font-semibold mb-1">Euronorm</p>
                <div className="flex gap-3 mb-2">
                  <span>Euro 6: <strong>{euro6Pct}%</strong></span>
                  <span>Euro 0-5: <strong>{euro05Pct}%</strong></span>
                </div>
                {seg.topKlassen.length > 0 && (
                  <>
                    <p className="font-semibold mb-1">Top klassen</p>
                    {seg.topKlassen.map((k) => (
                      <div key={k.klasse} className="flex justify-between">
                        <span className="truncate mr-2">{k.klasse}</span>
                        <span className="shrink-0">{k.pct}%</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </Popup>
          </Polyline>
        );
      })}
    </DynamicMap>
  );
}
