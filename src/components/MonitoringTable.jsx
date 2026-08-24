import { statusLabels, monitoringSites } from '../data/monitoringData';
import { SwipeIcon } from './Icons';

export default function MonitoringTable({ results }) {
  return (
    <>
    <div className="table-wrapper reveal">
      <table>
        <thead>
          <tr>
            <th>Kód</th>
            <th>Helyszín</th>
            <th>Jelleg</th>
            <th style={{ textAlign: 'center' }}>Lárva (db / 0,5 l)</th>
            <th>Fejlettség</th>
            <th>Állapot</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const site = monitoringSites.find((s) => s.code === r.siteCode);
            const status = statusLabels[r.status];
            return (
              <tr key={r.siteCode}>
                <td><strong>{r.siteCode}</strong></td>
                <td>{site?.name}{site?.note ? ` (${site.note})` : ''}</td>
                <td>{site?.type}</td>
                <td className="num">{r.larvae}</td>
                <td>{r.stages.length > 0 ? r.stages.join(', ') : '–'}</td>
                <td>
                  <span className={`badge ${status.className}`}>
                    <span className="badge-dot" />
                    {status.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    <p className="table-hint"><SwipeIcon /> Görgessen jobbra a további oszlopokért</p>
    </>
  );
}
