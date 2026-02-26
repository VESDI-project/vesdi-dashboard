'use client';

import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { FilterBar } from '@/components/layout/filter-bar';
import { KPICard } from '@/components/layout/kpi-card';
import { PAGE_COLORS, DMI_COLORS } from '@/lib/colors';
import { useVesdiStore } from '@/lib/store';
import { useFilteredZendingen } from '@/hooks/use-filtered-data';
import { zendingenPerNuts3Laad, zendingenPerNuts3Los, sumKPIs } from '@/lib/aggregate';
import { formatLargeNumber } from '@/lib/format';
import { PAGE_DESCRIPTIONS, KPI_TOOLTIPS } from '@/lib/descriptions';
import dynamic from 'next/dynamic';

const Nuts3Choropleth = dynamic(
  () => import('@/components/maps/nuts3-choropleth').then((m) => m.Nuts3Choropleth),
  { ssr: false, loading: () => <div className="h-[400px] bg-white/5 rounded-lg animate-pulse" /> }
);

export default function ZendingenOverzichtPage() {
  const municipality = useVesdiStore((s) => s.municipality);
  const zendingen = useFilteredZendingen();

  const naarGemeente = useMemo(
    () => zendingenPerNuts3Laad(zendingen, municipality?.code || ''),
    [zendingen, municipality]
  );
  const vanuitGemeente = useMemo(
    () => zendingenPerNuts3Los(zendingen, municipality?.code || ''),
    [zendingen, municipality]
  );

  const kpisNaar = useMemo(() => {
    const rows = zendingen.filter((r) => r.losGemeente === municipality?.code);
    return sumKPIs(rows);
  }, [zendingen, municipality]);

  const kpisVanuit = useMemo(() => {
    const rows = zendingen.filter((r) => r.laadGemeente === municipality?.code);
    return sumKPIs(rows);
  }, [zendingen, municipality]);

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Overzicht zendingen"
        color={PAGE_COLORS.zendingen.bg}
        description={PAGE_DESCRIPTIONS.zendingenOverzicht}
      />
      <FilterBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: naar de gemeente */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-dmi-text">
            Percentage zendingen naar de gemeente, per NUTS3-laadlocatie
          </h3>
          <Nuts3Choropleth
            data={naarGemeente}
            colorScale="teal"
            height={400}
          />
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              label="Bruto gewicht"
              value={formatLargeNumber(kpisNaar.brutoGewicht)}
              color={DMI_COLORS.primary}
              tooltip={KPI_TOOLTIPS.brutoGewicht}
            />
            <KPICard
              label="Aantal zendingen"
              value={formatLargeNumber(kpisNaar.zendingAantal)}
              color={DMI_COLORS.primary}
              tooltip={KPI_TOOLTIPS.zendingAantal}
            />
          </div>
        </div>

        {/* Right: vanuit de gemeente */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-dmi-text">
            Percentage zendingen vanuit de gemeente, per NUTS3-loslocatie
          </h3>
          <Nuts3Choropleth
            data={vanuitGemeente}
            colorScale="teal"
            height={400}
          />
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              label="Bruto gewicht"
              value={formatLargeNumber(kpisVanuit.brutoGewicht)}
              color={DMI_COLORS.primary}
              tooltip={KPI_TOOLTIPS.brutoGewicht}
            />
            <KPICard
              label="Aantal zendingen"
              value={formatLargeNumber(kpisVanuit.zendingAantal)}
              color={DMI_COLORS.primary}
              tooltip={KPI_TOOLTIPS.zendingAantal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
