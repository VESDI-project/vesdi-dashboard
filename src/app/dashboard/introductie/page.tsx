'use client';

import { useVesdiStore } from '@/lib/store';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { PAGE_COLORS } from '@/lib/colors';
import { PAGE_DESCRIPTIONS } from '@/lib/descriptions';
import Link from 'next/link';
import {
  TrendingUp,
  Map,
  Package,
  Globe,
  Truck,
  MapPin,
  Route,
  BarChart3,
  Link2,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

const NAV_BUTTONS = [
  { href: '/dashboard/trends', label: 'Overzicht en tendensen', icon: TrendingUp, color: '#A7BB54' },
  { href: '/dashboard/zendingen-overzicht', label: 'Zendingen overzicht', icon: Map, color: '#A7BB54' },
  { href: '/dashboard/nationale-zendingen', label: 'Nationale zendingen', icon: Package, color: '#A7BB54' },
  { href: '/dashboard/internationale-zendingen', label: 'Internationale zendingen', icon: Globe, color: '#8BA043' },
  { href: '/dashboard/nationale-deelritten', label: 'Nationale deelritten', icon: Truck, color: '#A7BB54' },
  { href: '/dashboard/nationale-deelritten-postcode', label: 'Nationale deelritten (postcode)', icon: MapPin, color: '#A7BB54' },
  { href: '/dashboard/routekaart', label: 'Nationale deelritten (routekaart)', icon: Route, color: '#A7BB54' },
  { href: '/dashboard/internationale-deelritten-overzicht', label: 'Internationale deelritten - overzicht', icon: Globe, color: '#8BA043' },
  { href: '/dashboard/internationale-deelritten', label: 'Internationale deelritten', icon: BarChart3, color: '#8BA043' },
  { href: '/dashboard/externe-links', label: 'Links', icon: Link2, color: '#8BA043' },
  { href: '/dashboard/definities', label: 'Definities', icon: BookOpen, color: '#5C6B2F' },
  { href: '/dashboard/data-volledigheid', label: 'Data volledigheid', icon: CheckCircle, color: '#5C6B2F' },
];

export default function IntroductiePage() {
  const municipality = useVesdiStore((s) => s.municipality);
  const years = useVesdiStore((s) => s.years);
  const sortedYears = [...years].sort((a, b) => a - b);

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Gemeentelijk VESDI-dashboard"
        color={PAGE_COLORS.introductie.accent}
        description={PAGE_DESCRIPTIONS.introductie}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main text */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <img
                src="/images/dmi-logo.svg"
                alt="DMI Ecosysteem"
                className="h-10 w-auto"
              />
            </div>

            <h2 className="text-xl font-bold text-dmi-text mb-4">
              Gemeentelijk VESDI-dashboard
            </h2>

            <div className="space-y-5 text-sm text-dmi-text/80 leading-relaxed">
              <p>
                In 2021 startte het CBS, in opdracht van het Ministerie van I&W en in
                samenwerking met de Topsector Logistiek, met de ontwikkeling van het
                dataplatform VESDI (Vehicle Emission Shipment Data Interface). E&eacute;n
                van de thema&apos;s die hierin centraal staat, is het wegvervoer van goederen.
              </p>

              <div>
                <h3 className="font-semibold text-dmi-text mb-1">
                  VESDI zendingen en deelritten
                </h3>
                <p>
                  VESDI verzamelt gegevens over goederenstromen in twee datasets. De eerste
                  is op zendingniveau, waarbij een zending het verplaatsen van goederen van
                  A naar B betreft. Deze dataset maakt het mogelijk goederen te traceren. De
                  tweede dataset is op deelritniveau: dit betreft het segment van de rit
                  tussen twee stops van het voertuig. Deze gegevens zijn waardevol voor het
                  analyseren van voertuigbewegingen. Beide datasets bevatten informatie zoals
                  stadslogistieke klasse, laad- en loslocaties (inclusief of deze zich in
                  emissiezones bevinden), beladingsgraad, voertuigtype, brandstofsoort en
                  emissieklasse.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dmi-text mb-1">
                  Dataverzameling
                </h3>
                <p>
                  De VESDI dataset over goederenvervoer over de weg is grotendeels gebaseerd
                  op een steekproef waarbij kentekens van voertuigen worden geselecteerd. Dit
                  gebeurt op basis van verschillende kenmerken, zoals laadvermogen en
                  voertuigtype. Elk jaar wordt van een aantal kentekens gedurende &eacute;&eacute;n
                  week data verzameld. De data wordt verzameld via een internetvragenlijst en
                  automatisch via Transport Management Systemen van bedrijven. De meeste
                  gegevens, zoals de locatie van goederen en de route, worden automatisch
                  gecodeerd. Slechts een klein deel van de data wordt handmatig gecontroleerd
                  en gecorrigeerd.
                </p>
                <p className="mt-3">
                  Dit dashboard bevat geen bestelbusdata.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dmi-text mb-1">
                  Verslagperiode
                </h3>
                <p>
                  Voor het opstellen van dit dashboard is de VESDI data van{' '}
                  {sortedYears.length > 0
                    ? sortedYears.join(', ')
                    : '...'}{' '}
                  gebruikt.
                  {sortedYears.length > 1 && (
                    <> De bestanden betreffende{' '}
                    {sortedYears.slice(1).join(' en ')}{' '}
                    bevatten alleen informatie over vervoersbewegingen waarvan de los- en/of
                    laadlocatie zich in de gemeente{' '}
                    <strong>
                      {municipality?.name || 'Onbekend'} (gemeentecode{' '}
                      {municipality?.code || '????'})
                    </strong>{' '}
                    bevindt. Om de data zo vergelijkbaar mogelijk te houden, zijn de bestanden
                    van {sortedYears[0]} aangepast om ook aan deze voorwaarde te voldoen.</>
                  )}
                  {sortedYears.length <= 1 && (
                    <> De bestanden bevatten informatie over vervoersbewegingen waarvan de
                    los- en/of laadlocatie zich in de gemeente{' '}
                    <strong>
                      {municipality?.name || 'Onbekend'} (gemeentecode{' '}
                      {municipality?.code || '????'})
                    </strong>{' '}
                    bevindt.</>
                  )}
                </p>
                <p className="mt-3">
                  Automatisch zal de data van het meest recente jaar getoond worden. Het
                  filter linksbovenin op pagina&apos;s met data kan gebruikt worden om dit
                  aan te passen.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Navigation buttons */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-dmi-table-accent mb-3">
            Dashboard pagina&apos;s
          </p>
          {NAV_BUTTONS.map((btn) => {
            const Icon = btn.icon;
            return (
              <Link key={btn.href} href={btn.href}>
                <div
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity mb-1"
                  style={{ backgroundColor: btn.color }}
                >
                  <Icon className="w-4 h-4" />
                  {btn.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
