import { useEffect, useState } from 'react';
import { measurements as fallbackMeasurements } from '../data/monitoringData';
import { fetchMeresek } from './meresek';

const byDateDesc = (a, b) => (a.surveyDate < b.surveyDate ? 1 : -1);

// A mérési körök a CMS-ből (admin felület) jönnek – ott a kódban rögzített
// 2026-os körök is szerepelnek, mert a szerver első indításkor betölti őket.
// Ha az API nem elérhető, a kódban lévő adatokra esünk vissza, hogy a publikus
// oldal soha ne maradjon üresen.
export function useAllMeasurements() {
  const [measurements, setMeasurements] = useState(() =>
    [...fallbackMeasurements].sort(byDateDesc)
  );

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchMeresek()
        .then((entries) => {
          if (cancelled || entries.length === 0) return;
          setMeasurements([...entries].sort(byDateDesc));
        })
        .catch(() => {});
    };

    load();
    const interval = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return measurements;
}
