import { randomUUID } from 'crypto';
import { measurements as seedMeasurements } from '../../src/data/monitoringData.js';

// Az oldal indulásakor a kódban rögzített 2026-os mérési körök bekerülnek a
// CMS tárolóba, hogy az ügyintéző ezeket is szerkeszthesse/törölhesse, ne csak
// az újakat. Egyetlen forrás marad (src/data/monitoringData.js), így nincs
// két helyen karbantartandó másolat.
export function buildSeedMeresek() {
  return seedMeasurements.map((m) => ({
    id: randomUUID(),
    surveyDate: m.surveyDate,
    reportDate: m.reportDate ?? m.surveyDate,
    publishDate: m.publishDate ?? m.reportDate ?? m.surveyDate,
    summary: m.summary ?? '',
    reportFileUrl: null,
    reportFileName: null,
    results: (m.results ?? []).map((r) => ({
      siteCode: r.siteCode,
      larvae: r.larvae ?? 0,
      stages: r.stages ?? [],
      status: r.status ?? 'clean',
    })),
    createdAt: new Date().toISOString(),
    seeded: true,
  }));
}
