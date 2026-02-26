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
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DMI_COLORS } from '@/lib/colors';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const NAV_ITEMS = [
  { href: '/dashboard/voorblad', icon: Home, label: 'Voorblad', color: DMI_COLORS.orange },
  { href: '/dashboard/introductie', icon: Info, label: 'Introductie', color: DMI_COLORS.primary },
  { href: '/dashboard/trends', icon: TrendingUp, label: 'Trends', color: DMI_COLORS.orange },
  { href: '/dashboard/zendingen-overzicht', icon: Map, label: 'Zendingen overzicht', color: DMI_COLORS.primary },
  { href: '/dashboard/nationale-zendingen', icon: Package, label: 'Nationale zendingen', color: DMI_COLORS.primary },
  { href: '/dashboard/internationale-zendingen', icon: Globe, label: 'Int. zendingen', color: DMI_COLORS.green },
  { href: '/dashboard/nationale-deelritten', icon: Truck, label: 'Nationale deelritten', color: DMI_COLORS.primary },
  { href: '/dashboard/nationale-deelritten-postcode', icon: MapPin, label: 'Deelritten postcode', color: DMI_COLORS.primary },
  { href: '/dashboard/routekaart', icon: Route, label: 'Routekaart', color: DMI_COLORS.primary },
  { href: '/dashboard/internationale-deelritten-overzicht', icon: Globe, label: 'Int. deelritten overzicht', color: DMI_COLORS.mauve },
  { href: '/dashboard/internationale-deelritten', icon: BarChart3, label: 'Int. deelritten', color: DMI_COLORS.mauve },
  { href: '/dashboard/externe-links', icon: Link2, label: 'Externe links', color: DMI_COLORS.purple },
  { href: '/dashboard/definities', icon: BookOpen, label: 'Definities', color: DMI_COLORS.green },
  { href: '/dashboard/data-volledigheid', icon: CheckCircle, label: 'Data volledigheid', color: DMI_COLORS.green },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-dmi-primary flex flex-col items-center py-4 z-50">
      {/* DMI logo */}
      <img
        src="/images/dmi-logo-diap.svg"
        alt="DMI"
        className="w-10 h-10 object-contain mb-2"
      />

      {/* Back to upload */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/"
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Terug naar upload</TooltipContent>
      </Tooltip>

      <div className="w-8 border-t border-white/20 mb-4" />

      {/* Nav items */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  )}
                  style={isActive ? { backgroundColor: item.color + '40' } : undefined}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
}
