'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PAGE_COLORS } from '@/lib/colors';
import { PAGE_DESCRIPTIONS } from '@/lib/descriptions';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { buildLegendBuckets } from '@/components/maps/route-map';

const RouteMap = dynamic(
  () => import('@/components/maps/route-map').then((m) => m.RouteMap),
  { ssr: false, loading: () => <div className="h-[500px] bg-white/5 rounded-lg animate-pulse" /> }
);

const ROUTE_OPTIONS = [
  { value: 100, label: '100' },
  { value: 200, label: '200' },
  { value: 500, label: '500' },
  { value: 1000, label: '1.000' },
  { value: 0, label: 'Alles' },
];

export default function RoutekaartPage() {
  const [legendBuckets, setLegendBuckets] = useState(buildLegendBuckets(0));
  const [maxRoutes, setMaxRoutes] = useState(200);
  const [totalPairs, setTotalPairs] = useState(0);

  const handleLegendData = useCallback((maxCount: number) => {
    setLegendBuckets(buildLegendBuckets(maxCount));
  }, []);

  const handleTotalPairs = useCallback((total: number) => {
    setTotalPairs(total);
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Routekaart"
        color={PAGE_COLORS.routekaart.accent}
        description={PAGE_DESCRIPTIONS.routekaart}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Legend + controls */}
        <div className="space-y-4">
          {/* Route limit selector */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-dmi-text mb-2">
              Aantal routes
            </h3>
            <p className="text-xs text-dmi-text/50 mb-3">
              Top PC4-herkomst-bestemmingsparen
              {totalPairs > 0 && (
                <> ({totalPairs.toLocaleString('nl-NL')} unieke paren)</>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ROUTE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMaxRoutes(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    maxRoutes === opt.value
                      ? 'bg-dmi-orange text-white'
                      : 'bg-dmi-bg text-dmi-text/70 hover:bg-dmi-orange/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-dmi-text mb-3">
              Aantal deelritten
            </h3>
            <div className="space-y-1">
              {legendBuckets.map((bucket, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-5 h-4 rounded-sm shrink-0"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="text-xs text-dmi-text/70">
                    {bucket.max
                      ? `${bucket.min.toLocaleString('nl-NL')} - ${bucket.max.toLocaleString('nl-NL')}`
                      : `${bucket.min.toLocaleString('nl-NL')}+`}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-dmi-text mb-2">
              Omschrijving kaart
            </h3>
            <div className="text-xs text-dmi-text/70 space-y-2">
              <p>
                De kaart toont de vermoedelijke routes op basis van deelritgegevens
                uit alle jaren in het dashboard.
              </p>
              <p>
                De kleur van een segment geeft aan hoeveel deelritten waarschijnlijk
                gebruik hebben gemaakt van die route. Klik op een route voor details
                over euronorm en stadslogistieke klasse.
              </p>
            </div>

            <h3 className="text-sm font-semibold text-dmi-text mb-2 mt-4">
              Beperkingen van de kaart
            </h3>
            <ul className="text-xs text-dmi-text/70 space-y-1 list-disc pl-4">
              <li>Alleen bewegingen met bekende PC4 laad- en loslocatie</li>
              <li>Routes zijn mogelijke, niet noodzakelijk werkelijk gereden routes</li>
              <li>Nauwkeurigheid hangt af van de kwaliteit van Open Route Service routing</li>
            </ul>
          </Card>

          <div className="flex items-start gap-2 p-3 bg-dmi-orange/10 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-dmi-orange shrink-0 mt-0.5" />
            <p className="text-xs text-dmi-orange">
              {maxRoutes === 0 || maxRoutes > 500
                ? 'Let op! Bij een groot aantal routes kan het laden enkele minuten duren.'
                : 'Let op! Het kan enige tijd duren voordat de kaart geladen is.'}
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <RouteMap
            key={maxRoutes}
            height={600}
            maxRoutes={maxRoutes}
            onLegendData={handleLegendData}
            onTotalPairs={handleTotalPairs}
          />
        </div>
      </div>
    </div>
  );
}
