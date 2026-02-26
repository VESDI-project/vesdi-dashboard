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
  { href: '/dashboard/nationale-zendingen', label: 'Nationale zendingen', icon: Package, color: '#A7BB54' },
  { href: '/dashboard/nationale-deelritten', label: 'Nationale deelritten', icon: Truck, color: '#A7BB54' },
  { href: '/dashboard/nationale-deelritten-postcode', label: 'Nationale deelritten (postcode)', icon: MapPin, color: '#A7BB54' },
  { href: '/dashboard/routekaart', label: 'Nationale deelritten (routekaart)', icon: Route, color: '#A7BB54' },
  { href: '/dashboard/internationale-deelritten-overzicht', label: 'Internationale deelritten - overzicht', icon: Globe, color: '#8BA043' },
  { href: '/dashboard/internationale-deelritten', label: 'Internationale deelritten', icon: BarChart3, color: '#8BA043' },
  { href: '/dashboard/internationale-zendingen', label: 'Internationale zendingen', icon: Map, color: '#8BA043' },
  { href: '/dashboard/externe-links', label: 'Links', icon: Link2, color: '#8BA043' },
  { href: '/dashboard/definities', label: 'Definities', icon: BookOpen, color: '#5C6B2F' },
  { href: '/dashboard/data-volledigheid', label: 'Data volledigheid', icon: CheckCircle, color: '#5C6B2F' },
];

export default function IntroductiePage() {
  const municipality = useVesdiStore((s) => s.municipality);
  const years = useVesdiStore((s) => s.years);

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
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/images/dmi-logo.svg"
                alt="DMI Ecosysteem"
                className="h-10 w-auto"
              />
            </div>

            <h2 className="text-xl font-bold text-dmi-text mb-4">
              Gemeentelijk VESDI-dashboard
            </h2>

            <div className="space-y-4 text-sm text-dmi-text/80 leading-relaxed">
              <div>
                <h3 className="font-semibold text-dmi-text mb-1">
                  VESDI zendingen en deelritten
                </h3>
                <p>
                  Het VESDI-databestand bevat informatie over de goederenstromen in Nederland.
                  De data is opgedeeld in twee bestanden: <strong>zendingen</strong> (pakket van
                  herkomst naar bestemming) en <strong>deelritten</strong> (vervoersbewegingen
                  per voertuig).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dmi-text mb-1">
                  Dataverzameling
                </h3>
                <p>
                  De data is afkomstig van Transport Management Systemen (TMS) en
                  routenavigatie-software van logistieke dienstverleners en vervoerders.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-dmi-text mb-1">
                  Verslagperiode
                </h3>
                <p>
                  Dit dashboard bevat data over de jaren {years.join(', ')} voor gemeente{' '}
                  <strong>
                    {municipality?.name || 'Onbekend'} (GM{municipality?.code || '????'})
                  </strong>
                  .
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
