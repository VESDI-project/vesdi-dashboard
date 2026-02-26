import { prisma } from '../prisma';

export async function getYears(datasetId: string): Promise<number[]> {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    select: { years: true },
  });
  return dataset?.years ?? [];
}

export async function getMunicipality(datasetId: string) {
  const dataset = await prisma.dataset.findUnique({
    where: { id: datasetId },
    select: { municipalityCode: true, municipalityName: true },
  });
  return dataset ? { code: dataset.municipalityCode, name: dataset.municipalityName } : null;
}

export async function getLookupByTable(datasetId: string, tableName: string) {
  return prisma.lookupEntry.findMany({
    where: { datasetId, tableName },
    select: { code: true, omschrijving: true },
    orderBy: { code: 'asc' },
  });
}
