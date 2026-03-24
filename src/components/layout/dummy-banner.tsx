'use client';

import { AlertTriangle, Sparkles } from 'lucide-react';
import { useVesdiStore } from '@/lib/store';
import { useAnprTable } from '@/lib/anpr-selectors';
import { generateDummyData } from '@/lib/anpr-generate-dummy';

interface DummyBannerProps {
  tableIds: string[];
}

export function DummyBanner({ tableIds }: DummyBannerProps) {
  const anprTables = useVesdiStore((s) => s.anprTables);
  const anprLookup = useVesdiStore((s) => s.anprLookup);
  const setAnprTables = useVesdiStore((s) => s.setAnprTables);
  const m1Table = useAnprTable('M1');

  // Check if any of the specified tables are dummy
  const hasDummy = tableIds.some((id) => anprTables.get(id)?.isDummy);
  if (!hasDummy) return null;

  // Check if dummy tables have all zeros
  const allZeros = tableIds.every((id) => {
    const table = anprTables.get(id);
    if (!table?.isDummy) return false;
    return table.rows.every((r) => r.aantalBezoeken === 0);
  });

  const handleGenerate = () => {
    if (!m1Table) return;
    const updated = generateDummyData(m1Table, anprTables, anprLookup);
    setAnprTables(updated);
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm text-amber-800 font-medium">
          Dummy-data
        </p>
        <p className="text-xs text-amber-700 mt-0.5">
          Deze pagina toont dummy-data. De werkelijke data wordt op een later moment beschikbaar gesteld door CBS.
        </p>
      </div>
      {allZeros && m1Table && (
        <button
          onClick={handleGenerate}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Genereer dummy-data
        </button>
      )}
    </div>
  );
}
