'use client';

import { useState, useEffect } from 'react';
import type { FeatureCollection } from 'geojson';

const cache = new Map<string, FeatureCollection>();

/**
 * Fetch and cache a GeoJSON file from /public/geo/
 */
export function useGeoJSON(path: string): {
  data: FeatureCollection | null;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<FeatureCollection | null>(cache.get(path) || null);
  const [loading, setLoading] = useState(!cache.has(path));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(path)) {
      setData(cache.get(path)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
        return res.json();
      })
      .then((geojson: FeatureCollection) => {
        if (!cancelled) {
          cache.set(path, geojson);
          setData(geojson);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  return { data, loading, error };
}
