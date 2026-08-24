import { useEffect, useState } from 'react';
import { measurements as staticMeasurements } from '../data/monitoringData';
import { fetchMeresek } from './meresek';

// A Főoldal és a Mérések oldal a kódban rögzített (korábbi szezon) és az admin
// felületen felvitt mérési köröket együtt, dátum szerint csökkenő sorrendben mutatja.
export function useAllMeasurements() {
  const [all, setAll] = useState(staticMeasurements);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      fetchMeresek()
        .then((cmsEntries) => {
          if (cancelled) return;
          const merged = [...cmsEntries, ...staticMeasurements].sort((a, b) =>
            a.surveyDate < b.surveyDate ? 1 : -1
          );
          setAll(merged);
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

  return all;
}
