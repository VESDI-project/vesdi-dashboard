import { ExternalLink } from 'lucide-react';

export function DataSourceFooter() {
  return (
    <p className="mt-8 text-xs text-dmi-text/50 leading-relaxed">
      Databron:{' '}
      <a
        href="https://www.cbs.nl/nl-nl/deelnemers-enquetes/bedrijven/overzicht-bedrijven/wegvervoer"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-dmi-text/70 inline-flex items-center gap-0.5"
      >
        CBS Wegvervoersenqu&ecirc;te
        <ExternalLink className="w-3 h-3" />
      </a>
      . De data betreft uitsluitend vrachtwagens (voertuigcategorie N2 en N3), niet bestelbussen (N1).
    </p>
  );
}
