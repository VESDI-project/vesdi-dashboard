'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { Polyline, Popup, Tooltip } from 'react-leaflet';
import { DynamicMap } from './dynamic-map';
import { useVesdiStore } from '@/lib/store';
import { ROUTE_HEAT_COLORS } from '@/lib/colors';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const ORS_PROFILE = 'driving-hgv';

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

interface GeoKeyPairAgg {
  fromKey: string;
  toKey: string;
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
    const res = await fetch(`/api/ors?profile=${ORS_PROFILE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

/** Load PC6, PC4 and NUTS3 centroid files and return a unified resolver */
async function loadCentroids(): Promise<Record<string, Centroid>> {
  const combined: Record<string, Centroid> = {};

  // Load all three in parallel
  const [pc6Res, pc4Res, nuts3Res] = await Promise.allSettled([
    fetch('/geo/pc6-centroids.json'),
    fetch('/geo/pc4-centroids.json'),
    fetch('/geo/nuts3-centroids.json'),
  ]);

  // PC6 centroids (format: {"1234AB": [lat, lng], ...})
  if (pc6Res.status === 'fulfilled' && pc6Res.value.ok) {
    try {
      const pc6Data: Record<string, [number, number]> = await pc6Res.value.json();
      for (const [code, coords] of Object.entries(pc6Data)) {
        combined[code] = { lat: coords[0], lng: coords[1] };
      }
    } catch {
      // PC6 parse error
    }
  }

  // PC4 centroids (format: {"1234": {lat, lng}, ...})
  if (pc4Res.status === 'fulfilled' && pc4Res.value.ok) {
    try {
      const pc4Data: Record<string, Centroid> = await pc4Res.value.json();
      Object.assign(combined, pc4Data);
    } catch {
      // PC4 parse error
    }
  }

  // NUTS3 centroids (keyed as "NUTS3:XX123")
  if (nuts3Res.status === 'fulfilled' && nuts3Res.value.ok) {
    try {
      const nuts3Data: Record<string, Centroid> = await nuts3Res.value.json();
      for (const [code, centroid] of Object.entries(nuts3Data)) {
        combined[`NUTS3:${code}`] = centroid;
      }
    } catch {
      // NUTS3 parse error
    }
  }

  return combined;
}

interface RouteMapProps {
  height?: number;
  maxRoutes?: number;
  useTrajectories?: boolean;
  onLegendData?: (maxCount: number) => void;
  onTotalPairs?: (total: number) => void;
}

export function RouteMap({ height = 500, maxRoutes = 200, useTrajectories = false, onLegendData, onTotalPairs }: RouteMapProps) {
  const deelrittenByYear = useVesdiStore((s) => s.deelrittenByYear);
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Aggregate unique geo key pairs across all years with Euro + klasse breakdown
  const allPairsSorted = useMemo((): GeoKeyPairAgg[] => {
    const map = new Map<string, GeoKeyPairAgg>();
    for (const rows of deelrittenByYear.values()) {
      for (const r of rows) {
        if (!r.isNational) continue;
        const from = r.geoKeyLaad;
        const to = r.geoKeyLos;
        if (!from || !to || from === to) continue;
        const key = `${from}->${to}`;
        let agg = map.get(key);
        if (!agg) {
          agg = { fromKey: from, toKey: to, count: 0, euro6Count: 0, euro05Count: 0, klasseMap: new Map() };
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
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [deelrittenByYear]);

  const geoKeyPairs = useMemo(
    () => maxRoutes > 0 ? allPairsSorted.slice(0, maxRoutes) : allPairsSorted,
    [allPairsSorted, maxRoutes]
  );

  useEffect(() => {
    onTotalPairs?.(allPairsSorted.length);
  }, [allPairsSorted.length, onTotalPairs]);

  const fetchRoutes = useCallback(async () => {
    if (geoKeyPairs.length === 0) {
      setLoading(false);
      return;
    }

    const centroidMap = await loadCentroids();
    if (Object.keys(centroidMap).length === 0) {
      setLoading(false);
      return;
    }

    const maxCount = Math.max(...geoKeyPairs.map((p) => p.count));
    onLegendData?.(maxCount);
    const results: RouteSegment[] = [];
    setProgress({ done: 0, total: geoKeyPairs.length });

    // Resolve centroid with PC6→PC4 fallback
    const resolveCentroid = (key: string): Centroid | undefined => {
      if (centroidMap[key]) return centroidMap[key];
      // If key looks like a PC6 (4 digits + 2 letters), fall back to PC4
      if (/^\d{4}[A-Z]{2}$/i.test(key)) {
        return centroidMap[key.substring(0, 4)];
      }
      return undefined;
    };

    // Pre-resolve centroids and filter out pairs without valid locations
    const resolvedPairs = geoKeyPairs
      .map((pair) => ({
        pair,
        from: resolveCentroid(pair.fromKey),
        to: resolveCentroid(pair.toKey),
      }))
      .filter((p): p is typeof p & { from: Centroid; to: Centroid } => !!p.from && !!p.to);

    setProgress({ done: 0, total: resolvedPairs.length });
    let done = 0;

    const buildSegment = (pair: GeoKeyPairAgg, coords: [number, number][]) => {
      const topKlassen = [...pair.klasseMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([klasse, count]) => ({
          klasse,
          count,
          pct: pair.count > 0 ? Math.round((count / pair.count) * 100) : 0,
        }));
      return {
        coordinates: coords,
        count: pair.count,
        color: getHeatColor(pair.count, maxCount),
        euro6Count: pair.euro6Count,
        euro05Count: pair.euro05Count,
        topKlassen,
      };
    };

    if (!useTrajectories) {
      // Straight lines — no ORS calls, instant rendering
      for (const { pair, from, to } of resolvedPairs) {
        results.push(buildSegment(pair, [[from.lat, from.lng], [to.lat, to.lng]]));
      }
      setProgress({ done: resolvedPairs.length, total: resolvedPairs.length });
    } else {
      // Fetch actual trajectories from ORS in parallel batches
      const BATCH_SIZE = 10;
      for (let batchStart = 0; batchStart < resolvedPairs.length; batchStart += BATCH_SIZE) {
        const batch = resolvedPairs.slice(batchStart, batchStart + BATCH_SIZE);

        const batchResults = await Promise.all(
          batch.map(async ({ pair, from, to }) => {
            let coords = await fetchRoute(from.lat, from.lng, to.lat, to.lng);
            if (!coords || coords.length === 0) {
              coords = [[from.lat, from.lng], [to.lat, to.lng]];
            }
            return buildSegment(pair, coords);
          })
        );

        results.push(...batchResults);
        done += batch.length;
        setProgress({ done, total: resolvedPairs.length });
      }
    }

    results.sort((a, b) => a.count - b.count);
    setSegments(results);
    setLoading(false);
  }, [geoKeyPairs, useTrajectories, onLegendData]);

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
