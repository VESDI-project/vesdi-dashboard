'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Info,
  TrendingUp,
  Map,
  Truck,
  Package,
  Globe,
  Route,
  BarChart3,
  Link2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DMI_COLORS } from '@/lib/colors';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from './sidebar-context';

const NAV_ITEMS = [
  { href: '/dashboard/voorblad', icon: Home, label: 'Voorblad', desc: 'Titelpagina en samenvatting', color: DMI_COLORS.orange },
  { href: '/dashboard/introductie', icon: Info, label: 'Introductie', desc: 'Uitleg dashboard en navigatie', color: DMI_COLORS.primary },
  { href: '/dashboard/trends', icon: TrendingUp, label: 'Trends', desc: 'Ontwikkeling over meerdere jaren', color: DMI_COLORS.orange },
  { href: '/dashboard/zendingen-overzicht', icon: Map, label: 'Zendingen overzicht', desc: 'NUTS3-choropleet van alle zendingen', color: DMI_COLORS.primary },
  { href: '/dashboard/nationale-zendingen', icon: Package, label: 'Nationale zendingen', desc: 'Gewicht, klassen en euronorm binnenland', color: DMI_COLORS.primary },
  { href: '/dashboard/internationale-zendingen', icon: Globe, label: 'Int. zendingen', desc: 'Import/export per land en klasse', color: DMI_COLORS.green },
  { href: '/dashboard/nationale-deelritten', icon: Truck, label: 'Nationale deelritten', desc: 'Ritten, beladingsgraad en voertuigsoort', color: DMI_COLORS.primary },
  { href: '/dashboard/nationale-deelritten-postcode', icon: MapPin, label: 'Deelritten postcode', desc: 'Laad- en loslocaties per PC4-gebied', color: DMI_COLORS.primary },
  { href: '/dashboard/routekaart', icon: Route, label: 'Routekaart', desc: 'Vermoedelijke routes op het wegennet', color: DMI_COLORS.primary },
  { href: '/dashboard/internationale-deelritten-overzicht', icon: Globe, label: 'Int. deelritten overzicht', desc: 'NUTS3-overzicht grensoverschrijdend', color: DMI_COLORS.mauve },
  { href: '/dashboard/internationale-deelritten', icon: BarChart3, label: 'Int. deelritten', desc: 'Voertuigsoort en gewichtsklassen', color: DMI_COLORS.mauve },
  { href: '/dashboard/externe-links', icon: Link2, label: 'Externe links', desc: 'CBS, VESDI en DMI bronnen', color: DMI_COLORS.purple },
  { href: '/dashboard/definities', icon: BookOpen, label: 'Definities', desc: 'Begrippen en classificaties', color: DMI_COLORS.green },
  { href: '/dashboard/data-volledigheid', icon: CheckCircle, label: 'Data volledigheid', desc: 'Dekking per kolom en jaar', color: DMI_COLORS.green },
  { href: '/dashboard/api', icon: Code2, label: 'API', desc: 'REST API-documentatie (OpenAPI)', color: DMI_COLORS.purple },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { expanded, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-dmi-primary flex flex-col py-4 z-50 transition-all duration-200',
        expanded ? 'w-64' : 'w-16'
      )}
    >
      {/* DMI logo */}
      <div className={cn('flex items-center mb-2', expanded ? 'px-3' : 'justify-center')}>
        <img
          src="/images/dmi-logo-diap.svg"
          alt="DMI Ecosysteem"
          className={cn(
            'object-contain transition-all duration-200',
            expanded ? 'h-12' : 'w-10 h-10'
          )}
        />
      </div>

      {/* Back to upload */}
      <div className={cn('flex', expanded ? 'px-2' : 'justify-center')}>
        {expanded ? (
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 shrink-0" />
            <span className="text-sm truncate">Terug naar upload</span>
          </Link>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/"
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Terug naar upload</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className={cn('border-t border-white/20 my-3', expanded ? 'mx-3' : 'mx-4')} />

      {/* Nav items */}
      <nav className={cn(
        'flex-1 flex flex-col gap-0.5 overflow-y-auto',
        expanded ? 'px-2' : 'items-center'
      )}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          const linkEl = (
            <Link
              href={item.href}
              className={cn(
                'flex rounded-lg transition-colors',
                expanded
                  ? 'items-start gap-2.5 px-2.5 py-2'
                  : 'items-center w-10 h-10 justify-center',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
              style={isActive ? { backgroundColor: item.color + '40' } : undefined}
            >
              <Icon className={cn('w-5 h-5 shrink-0', expanded && 'mt-0.5')} />
              {expanded && (
                <div className="min-w-0">
                  <span className="text-sm font-medium truncate block">{item.label}</span>
                  <span className="text-[11px] text-white/40 truncate block">{item.desc}</span>
                </div>
              )}
            </Link>
          );

          if (expanded) {
            return <div key={item.href}>{linkEl}</div>;
          }

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      {/* Expand/collapse toggle */}
      <div className={cn('mt-2', expanded ? 'px-2' : 'flex justify-center')}>
        <button
          onClick={toggle}
          className={cn(
            'flex items-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors',
            expanded
              ? 'w-full gap-2.5 px-2.5 py-2'
              : 'w-10 h-10 justify-center'
          )}
        >
          {expanded ? (
            <>
              <PanelLeftClose className="w-5 h-5 shrink-0" />
              <span className="text-sm">Inklappen</span>
            </>
          ) : (
            <PanelLeftOpen className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
