'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  ZendingRow,
  DeelritRow,
  LookupData,
  MunicipalityInfo,
  FilterState,
  DetectedFile,
  NutsMapping,
} from './types';
import { parseCSV, readFileAsText, readFileAsArrayBuffer } from './parse-csv';
import { parseLookupXlsx, parseNutsSchema } from './parse-xlsx';
import { detectFileType } from './validate';
import { transformZendingen, transformDeelritten } from './transform';
import { idbStorage } from './idb-storage';

interface VesdiStore {
  // Data (persisted)
  zendingenByYear: Map<number, ZendingRow[]>;
  deelrittenByYear: Map<number, DeelritRow[]>;
  lookup: LookupData | null;
  nutsMapping: NutsMapping[];
  municipality: MunicipalityInfo | null;
  years: number[];
  heroImage: string | null;
  filters: FilterState;

  // UI state (not persisted)
  detectedFiles: DetectedFile[];
  isProcessing: boolean;
  processingStatus: string;
  _hydrated: boolean;

  // Actions
  processFiles: (files: File[]) => Promise<void>;
  setFilter: (key: keyof FilterState, value: string | number | null) => void;
  resetFilters: () => void;
  clear: () => void;
}

// Shape of the serialized state in IndexedDB (Maps become Records)
interface PersistedState {
  zendingenByYear: Record<string, ZendingRow[]>;
  deelrittenByYear: Record<string, DeelritRow[]>;
  lookup: LookupData | null;
  nutsMapping: NutsMapping[];
  municipality: MunicipalityInfo | null;
  years: number[];
  heroImage: string | null;
  filters: FilterState;
}

const defaultFilters: FilterState = {
  year: null,
  euronorm: null,
  laadEmissiezone: null,
  losEmissiezone: null,
  handelsrichting: null,
};

/** Convert a File to a base64 data URL */
async function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const useVesdiStore = create<VesdiStore>()(
  persist(
    (set, get) => ({
      zendingenByYear: new Map(),
      deelrittenByYear: new Map(),
      lookup: null,
      nutsMapping: [],
      municipality: null,
      years: [],
      heroImage: null,
      detectedFiles: [],
      isProcessing: false,
      processingStatus: '',
      filters: { ...defaultFilters },
      _hydrated: false,

      processFiles: async (files: File[]) => {
        set({ isProcessing: true, processingStatus: 'Bestanden detecteren...' });

        // Phase 1: Detect all files (accumulate with previously detected files)
        const previousFiles = get().detectedFiles;
        const detected: DetectedFile[] = [];
        for (const file of files) {
          const result = await detectFileType(file);
          detected.push(result);
        }
        set({ detectedFiles: [...previousFiles, ...detected] });

        // Phase 2: Parse lookup first (needed for transform)
        let lookup = get().lookup;
        const lookupFile = detected.find((d) => d.type === 'VESDI_LOOKUP');
        if (lookupFile) {
          set({ processingStatus: 'Lookup-tabel verwerken...' });
          const buffer = await readFileAsArrayBuffer(lookupFile.file);
          lookup = parseLookupXlsx(buffer);
          set({ lookup });
        }

        // Parse NUTS schema
        const nutsFile = detected.find((d) => d.type === 'NUTS_SCHEMA');
        if (nutsFile) {
          set({ processingStatus: 'NUTS-schema verwerken...' });
          const buffer = await readFileAsArrayBuffer(nutsFile.file);
          const nutsMapping = parseNutsSchema(buffer);
          set({ nutsMapping });
        }

        // Phase 3: Parse data CSVs
        const zendingenByYear = new Map(get().zendingenByYear);
        const deelrittenByYear = new Map(get().deelrittenByYear);
        const yearsSet = new Set(get().years);

        const zendingenFiles = detected.filter((d) => d.type === 'ZENDINGEN');
        for (const zf of zendingenFiles) {
          set({ processingStatus: `Zendingenbestand verwerken: ${zf.file.name}...` });
          const text = await readFileAsText(zf.file);
          const { data } = parseCSV<ZendingRow>(text);
          const transformed = transformZendingen(data, lookup);
          const year = zf.year || (transformed[0]?.jaar ?? 0);
          if (year) {
            zendingenByYear.set(year, transformed);
            yearsSet.add(year);
          }
        }

        const deelrittenFiles = detected.filter((d) => d.type === 'DEELRITTEN');
        for (const df of deelrittenFiles) {
          set({ processingStatus: `Deelrittenbestand verwerken: ${df.file.name}...` });
          const text = await readFileAsText(df.file);
          const { data } = parseCSV<DeelritRow>(text);
          const transformed = transformDeelritten(data, lookup);
          const year = df.year || (transformed[0]?.jaar ?? 0);
          if (year) {
            deelrittenByYear.set(year, transformed);
            yearsSet.add(year);
          }
        }

        const years = [...yearsSet].sort();

        // Phase 4: Auto-detect municipality
        let municipality = get().municipality;
        if (!municipality) {
          for (const rows of zendingenByYear.values()) {
            const roiRows = rows.filter((r) => r.dummy_laadInROI === 1);
            if (roiRows.length > 0) {
              const gemCounts = new Map<string, number>();
              for (const r of roiRows) {
                gemCounts.set(r.laadGemeente, (gemCounts.get(r.laadGemeente) || 0) + r.zendingAantal);
              }
              let maxCode = '';
              let maxCount = 0;
              for (const [code, count] of gemCounts) {
                if (count > maxCount) {
                  maxCode = code;
                  maxCount = count;
                }
              }
              if (maxCode) {
                const nameEntry = lookup?.gemeentecode.find(
                  (e) => String(e.code) === maxCode || String(e.code).padStart(4, '0') === maxCode
                );
                const nutsEntry = get().nutsMapping.find(
                  (n) => n.gemeentecode === maxCode || n.gemeentecode === maxCode.padStart(4, '0')
                );
                let filenameName = '';
                const allDetected = [...previousFiles, ...detected];
                for (const df of allDetected) {
                  const match = df.file.name.match(/_PC6_([A-Za-z\s'-]+)_\d{4}/);
                  if (match) { filenameName = match[1]; break; }
                }
                municipality = {
                  code: maxCode,
                  name: nutsEntry?.gemeentenaam || nameEntry?.omschrijving || filenameName || maxCode,
                };
              }
              break;
            }
          }
        }

        // Handle hero image — store as data URL (base64) so it persists
        const heroFile = detected.find((d) => d.type === 'HERO_IMAGE');
        let heroImage = get().heroImage;
        if (heroFile) {
          heroImage = await fileToDataURL(heroFile.file);
        }

        set({
          zendingenByYear,
          deelrittenByYear,
          years,
          municipality,
          heroImage,
          isProcessing: false,
          processingStatus: 'Klaar!',
          filters: { ...defaultFilters, year: years[years.length - 1] || null },
        });
      },

      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },

      resetFilters: () => {
        const years = get().years;
        set({
          filters: { ...defaultFilters, year: years[years.length - 1] || null },
        });
      },

      clear: () => {
        set({
          zendingenByYear: new Map(),
          deelrittenByYear: new Map(),
          lookup: null,
          nutsMapping: [],
          municipality: null,
          years: [],
          heroImage: null,
          detectedFiles: [],
          isProcessing: false,
          processingStatus: '',
          filters: { ...defaultFilters },
        });
      },
    }),
    {
      name: 'vesdi-store',
      storage: createJSONStorage(() => idbStorage),

      // Only persist data fields — skip transient UI state and non-serializable File objects
      partialize: (state) => ({
        zendingenByYear: Object.fromEntries(state.zendingenByYear),
        deelrittenByYear: Object.fromEntries(state.deelrittenByYear),
        lookup: state.lookup,
        nutsMapping: state.nutsMapping,
        municipality: state.municipality,
        years: state.years,
        heroImage: state.heroImage,
        filters: state.filters,
      }),

      // Convert serialized Records back to Maps on rehydration
      merge: (persistedState, currentState) => {
        const ps = persistedState as Partial<PersistedState> | undefined;
        if (!ps) return { ...currentState, _hydrated: true };

        return {
          ...currentState,
          ...ps,
          zendingenByYear: ps.zendingenByYear
            ? new Map(
                Object.entries(ps.zendingenByYear).map(([k, v]) => [Number(k), v])
              )
            : currentState.zendingenByYear,
          deelrittenByYear: ps.deelrittenByYear
            ? new Map(
                Object.entries(ps.deelrittenByYear).map(([k, v]) => [Number(k), v])
              )
            : currentState.deelrittenByYear,
          _hydrated: true,
        };
      },

      onRehydrateStorage: () => {
        return () => {
          // Mark as hydrated after rehydration completes
          useVesdiStore.setState({ _hydrated: true });
        };
      },
    }
  )
);
