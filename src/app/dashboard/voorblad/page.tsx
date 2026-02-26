'use client';

import { useVesdiStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';

export default function VoorbladPage() {
  const municipality = useVesdiStore((s) => s.municipality);
  const heroImage = useVesdiStore((s) => s.heroImage);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden bg-dmi-text min-h-[500px] flex flex-col justify-between">
        {/* Background image */}
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 p-8">
          <img
            src="/images/dmi-logo-diap.svg"
            alt="DMI Ecosysteem"
            className="h-12 w-auto"
          />
        </div>

        <div className="relative z-10 p-8 flex items-end justify-between">
          {/* Wikipedia attribution for auto-fetched images */}
          {heroImage && !heroImage.startsWith('data:') && (
            <span className="text-white/50 text-xs">
              Foto: Wikimedia Commons
            </span>
          )}
          <Badge className="bg-dmi-orange text-white text-2xl font-bold px-8 py-3 rounded-xl hover:bg-dmi-orange ml-auto">
            {municipality?.name || 'Gemeente'}
          </Badge>
        </div>
      </div>
    </div>
  );
}
