import { SwipeIcon } from './Icons';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function GocpontKutatasTable({ entries }) {
  if (entries.length === 0) {
    return <p>Még nincs rögzített terepi gócpont-kutatás.</p>;
  }

  return (
    <>
      <div className="table-wrapper reveal">
        <table>
          <thead>
            <tr>
              <th>Dátum</th>
              <th>Idő</th>
              <th style={{ textAlign: 'center' }}>Időtartam (perc)</th>
              <th>Helyszín</th>
              <th style={{ textAlign: 'center' }}>Csípés-szám</th>
              <th style={{ textAlign: 'center' }}>Befogott (db)</th>
              <th style={{ textAlign: 'center' }}>Csípésterhelés (db/óra)</th>
              <th>Szúnyogkeltető helyek</th>
              <th>Kezelés típusa</th>
              <th>Jövőbeni intézkedések</th>
              <th>Lárvagyűjtés</th>
              <th>Megjegyzés</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{formatDate(entry.date)}</td>
                <td>{entry.time}</td>
                <td className="num">{entry.durationMin ?? '-'}</td>
                <td>{entry.location}</td>
                <td className="num">{entry.biteCount}</td>
                <td className="num">{entry.caughtCount}</td>
                <td className="num">{entry.biteLoadPerHour}</td>
                <td>{entry.breedingSites}</td>
                <td>{entry.treatmentType}</td>
                <td>{entry.futureActions}</td>
                <td>{entry.larvaeCollected === 'igen' ? `Igen – ${entry.larvaeAmount}` : 'Nem'}</td>
                <td>{entry.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-hint"><SwipeIcon /> Görgessen jobbra a további oszlopokért</p>
    </>
  );
}
