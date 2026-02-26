import { prisma } from './prisma';
import type { PrismaClient } from '@/generated/prisma/client';
import type { ZendingRow, DeelritRow, LookupData, NutsMapping, MunicipalityInfo } from '@/lib/types';

type TransactionClient = Parameters<Parameters<PrismaClient['$transaction']>[0]>[0];

const CHUNK_SIZE = 5000;

interface SyncPayload {
  municipality: MunicipalityInfo;
  years: number[];
  zendingenByYear: Record<string, ZendingRow[]>;
  deelrittenByYear: Record<string, DeelritRow[]>;
  lookup: LookupData | null;
  nutsMapping: NutsMapping[];
}

export async function syncDataset(payload: SyncPayload) {
  const { municipality, years, zendingenByYear, deelrittenByYear, lookup, nutsMapping } = payload;

  await prisma.$transaction(async (tx: TransactionClient) => {
    // Upsert dataset (same municipality = replace)
    const existing = await tx.dataset.findUnique({
      where: { municipalityCode: municipality.code },
    });

    if (existing) {
      // Delete old data (cascade will clean zendingen, deelritten, lookups, nuts)
      await tx.dataset.delete({ where: { id: existing.id } });
    }

    const dataset = await tx.dataset.create({
      data: {
        municipalityCode: municipality.code,
        municipalityName: municipality.name,
        years,
      },
    });

    // Bulk-insert zendingen in chunks
    for (const [, rows] of Object.entries(zendingenByYear)) {
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        await tx.zending.createMany({
          data: chunk.map((r) => ({
            datasetId: dataset.id,
            jaar: r.jaar,
            laadPC6: r.laadPC6 ?? '',
            laadPC4: r.laadPC4 ?? '',
            laadGemeente: r.laadGemeente ?? '',
            laadNuts3: r.laadNuts3 ?? '',
            losPC6: r.losPC6 ?? '',
            losPC4: r.losPC4 ?? '',
            losGemeente: r.losGemeente ?? '',
            losNuts3: r.losNuts3 ?? '',
            stadslogistieke_klasse_code: r.stadslogistieke_klasse_code,
            euronormKlasse: r.euronormKlasse ?? '',
            brandstofsoortKlasse: r.brandstofsoortKlasse,
            dummy_laadInROI: r.dummy_laadInROI,
            dummy_losInROI: r.dummy_losInROI,
            zendingAantal: r.zendingAantal,
            brutoGewicht: r.brutoGewicht,
            zendingAfstandGemiddeld: r.zendingAfstandGemiddeld,
            laad_zone_emissiezonePC6: r.laad_zone_emissiezonePC6 ?? null,
            laad_zone_voetganger: r.laad_zone_voetganger ?? null,
            laad_zone_afgesloten_laden_lossen: r.laad_zone_afgesloten_laden_lossen ?? null,
            laad_zone_afgesloten: r.laad_zone_afgesloten ?? null,
            los_zone_emissiezonePC6: r.los_zone_emissiezonePC6 ?? null,
            los_zone_voetganger: r.los_zone_voetganger ?? null,
            los_zone_afgesloten_laden_lossen: r.los_zone_afgesloten_laden_lossen ?? null,
            los_zone_afgesloten: r.los_zone_afgesloten ?? null,
            LaadLand: r.LaadLand ?? null,
            LosLand: r.LosLand ?? null,
            PC4LaadNL: r.PC4LaadNL ?? null,
            PC4LosNL: r.PC4LosNL ?? null,
            geoKeyLaad: r.geoKeyLaad ?? null,
            geoKeyLos: r.geoKeyLos ?? null,
            geoLevelLaad: r.geoLevelLaad ?? null,
            geoLevelLos: r.geoLevelLos ?? null,
            isNational: r.isNational ?? null,
            isInternational: r.isInternational ?? null,
            isImport: r.isImport ?? null,
            isExport: r.isExport ?? null,
            stadslogistieke_klasse: r.stadslogistieke_klasse ?? null,
          })),
        });
      }
    }

    // Bulk-insert deelritten in chunks
    for (const [, rows] of Object.entries(deelrittenByYear)) {
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        await tx.deelrit.createMany({
          data: chunk.map((r) => ({
            datasetId: dataset.id,
            jaar: r.jaar,
            voertuigsoortRDW: r.voertuigsoortRDW,
            laadPC6: r.laadPC6 ?? '',
            laadPC4: r.laadPC4 ?? '',
            laadGemeente: r.laadGemeente ?? '',
            laadNuts3: r.laadNuts3 ?? '',
            losPC6: r.losPC6 ?? '',
            losPC4: r.losPC4 ?? '',
            losGemeente: r.losGemeente ?? '',
            losNuts3: r.losNuts3 ?? '',
            stadslogistieke_klasse_code: r.stadslogistieke_klasse_code,
            stadslogistieke_klasse_legeRit_code: r.stadslogistieke_klasse_legeRit_code ?? '',
            euronormKlasse: r.euronormKlasse ?? '',
            brandstofsoortKlasse: r.brandstofsoortKlasse,
            laadvermogenCombinatie_klasse: r.laadvermogenCombinatie_klasse ?? '',
            leeggewichtCombinatie_klasse: r.leeggewichtCombinatie_klasse ?? '',
            maxToegestaanGewicht_klasse: r.maxToegestaanGewicht_klasse ?? '',
            dummy_laadInROI: r.dummy_laadInROI,
            dummy_losInROI: r.dummy_losInROI,
            aantalDeelritten: r.aantalDeelritten,
            aantalLegeDeelritten: r.aantalLegeDeelritten,
            brutoGewicht: r.brutoGewicht,
            deelritAfstandGemiddeld: r.deelritAfstandGemiddeld,
            beladingsgraadGewichtGemiddeld: r.beladingsgraadGewichtGemiddeld,
            aantalZendingenRitGemiddeld: r.aantalZendingenRitGemiddeld,
            laad_zone_emissiezonePC6: r.laad_zone_emissiezonePC6 ?? null,
            laad_zone_voetganger: r.laad_zone_voetganger ?? null,
            laad_zone_afgesloten_laden_lossen: r.laad_zone_afgesloten_laden_lossen ?? null,
            laad_zone_afgesloten: r.laad_zone_afgesloten ?? null,
            los_zone_emissiezonePC6: r.los_zone_emissiezonePC6 ?? null,
            los_zone_voetganger: r.los_zone_voetganger ?? null,
            los_zone_afgesloten_laden_lossen: r.los_zone_afgesloten_laden_lossen ?? null,
            los_zone_afgesloten: r.los_zone_afgesloten ?? null,
            LaadLand: r.LaadLand ?? null,
            LosLand: r.LosLand ?? null,
            PC4LaadNL: r.PC4LaadNL ?? null,
            PC4LosNL: r.PC4LosNL ?? null,
            geoKeyLaad: r.geoKeyLaad ?? null,
            geoKeyLos: r.geoKeyLos ?? null,
            geoLevelLaad: r.geoLevelLaad ?? null,
            geoLevelLos: r.geoLevelLos ?? null,
            isNational: r.isNational ?? null,
            isInternational: r.isInternational ?? null,
            isImport: r.isImport ?? null,
            isExport: r.isExport ?? null,
            stadslogistieke_klasse: r.stadslogistieke_klasse ?? null,
            voertuigsoort: r.voertuigsoort ?? null,
          })),
        });
      }
    }

    // Insert lookup entries
    if (lookup) {
      const lookupRows: { tableName: string; code: string; omschrijving: string }[] = [];
      for (const [tableName, entries] of Object.entries(lookup)) {
        for (const entry of entries) {
          lookupRows.push({
            tableName,
            code: String(entry.code),
            omschrijving: entry.omschrijving,
          });
        }
      }
      for (let i = 0; i < lookupRows.length; i += CHUNK_SIZE) {
        const chunk = lookupRows.slice(i, i + CHUNK_SIZE);
        await tx.lookupEntry.createMany({
          data: chunk.map((r) => ({ datasetId: dataset.id, ...r })),
        });
      }
    }

    // Insert NUTS mappings
    if (nutsMapping.length > 0) {
      for (let i = 0; i < nutsMapping.length; i += CHUNK_SIZE) {
        const chunk = nutsMapping.slice(i, i + CHUNK_SIZE);
        await tx.nutsMappingRow.createMany({
          data: chunk.map((r) => ({
            datasetId: dataset.id,
            gemeentecode: r.gemeentecode,
            gemeentenaam: r.gemeentenaam,
            nuts1: r.nuts1,
            nuts2: r.nuts2,
            nuts3: r.nuts3,
            degurba: r.degurba,
          })),
        });
      }
    }

    return dataset;
  }, { timeout: 120000 });
}
