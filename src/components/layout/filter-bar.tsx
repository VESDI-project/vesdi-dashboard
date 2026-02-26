'use client';

import { useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVesdiStore } from '@/lib/store';

/** Check if the loaded data has emissiezone columns */
function useHasEmissiezoneData(): boolean {
  const zendingenByYear = useVesdiStore((s) => s.zendingenByYear);
  return useMemo(() => {
    for (const rows of zendingenByYear.values()) {
      if (rows.length > 0 && rows[0].laad_zone_emissiezonePC6 != null) {
        return true;
      }
    }
    return false;
  }, [zendingenByYear]);
}

interface FilterBarProps {
  showEuronorm?: boolean;
  showEmissiezone?: boolean;
  showHandelsrichting?: boolean;
}

export function FilterBar({
  showEuronorm = false,
  showEmissiezone = false,
  showHandelsrichting = false,
}: FilterBarProps) {
  const years = useVesdiStore((s) => s.years);
  const filters = useVesdiStore((s) => s.filters);
  const setFilter = useVesdiStore((s) => s.setFilter);
  const hasEmissiezone = useHasEmissiezoneData();
  const showEZ = showEmissiezone && hasEmissiezone;

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 rounded-lg bg-muted/50 border border-border px-4 py-3">
      <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mr-1">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </span>
      {/* Year filter */}
      <Select
        value={filters.year ? String(filters.year) : ''}
        onValueChange={(v) => setFilter('year', Number(v))}
      >
        <SelectTrigger className="w-[120px] bg-[#004D6E] border-[#004D6E] text-white">
          <SelectValue placeholder="Jaar" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Euronorm filter */}
      {showEuronorm && (
        <Select
          value={filters.euronorm || 'all'}
          onValueChange={(v) => setFilter('euronorm', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[140px] bg-[#004D6E] border-[#004D6E] text-white">
            <SelectValue placeholder="Euronorm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="6">Euro 6</SelectItem>
            <SelectItem value="0-5">Euro 0-5</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Emissiezone laden */}
      {showEZ && (
        <>
          <Select
            value={filters.laadEmissiezone || 'all'}
            onValueChange={(v) => setFilter('laadEmissiezone', v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[180px] bg-[#004D6E] border-[#004D6E] text-white">
              <SelectValue placeholder="Laden emissiezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Laden EZ: Alle</SelectItem>
              <SelectItem value="ja">Ja</SelectItem>
              <SelectItem value="nee">Nee</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.losEmissiezone || 'all'}
            onValueChange={(v) => setFilter('losEmissiezone', v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[180px] bg-[#004D6E] border-[#004D6E] text-white">
              <SelectValue placeholder="Lossen emissiezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Lossen EZ: Alle</SelectItem>
              <SelectItem value="ja">Ja</SelectItem>
              <SelectItem value="nee">Nee</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      {/* Handelsrichting */}
      {showHandelsrichting && (
        <Select
          value={filters.handelsrichting || 'all'}
          onValueChange={(v) => setFilter('handelsrichting', v === 'all' ? null : v)}
        >
          <SelectTrigger className="w-[160px] bg-[#004D6E] border-[#004D6E] text-white">
            <SelectValue placeholder="Handelsrichting" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="import">Import</SelectItem>
            <SelectItem value="export">Export</SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
