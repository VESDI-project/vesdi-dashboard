'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { PAGE_COLORS } from '@/lib/colors';
import { PAGE_DESCRIPTIONS } from '@/lib/descriptions';
import { ExternalLink } from 'lucide-react';

const LINKS = [
  {
    title: 'VESDI achtergrond',
    description: 'Informatie over het VESDI-project bij het CBS',
    url: 'https://www.cbs.nl/nl-nl/onze-diensten/maatwerk-en-microdata/microdata-zelf-onderzoek-doen/microdatabestanden/vesdi-verkeersintensiteiten-stedelijke-distributie',
    icon: '📊',
  },
  {
    title: 'Post- en pakketmonitor',
    description: 'Monitor voor post- en pakketstromen in Nederland',
    url: 'https://www.acm.nl/nl/onderwerpen/telecommunicatie/post/post-en-pakketmonitor',
    icon: '📦',
  },
  {
    title: 'VESDI maatwerkverzoeken',
    description: 'Aanvullende VESDI-data op maat aanvragen',
    url: 'https://www.cbs.nl/nl-nl/onze-diensten/maatwerk-en-microdata/maatwerk',
    icon: '🎯',
  },
];

export default function ExterneLinkPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Externe links"
        color={PAGE_COLORS.externeLinks.accent}
        description={PAGE_DESCRIPTIONS.externeLinks}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {LINKS.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="text-4xl mb-4">{link.icon}</div>
              <h3 className="font-semibold text-dmi-text mb-2 group-hover:text-dmi-purple transition-colors">
                {link.title}
              </h3>
              <p className="text-sm text-dmi-text/60 mb-4">
                {link.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-dmi-purple">
                <ExternalLink className="w-3 h-3" />
                <span>Openen</span>
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}
