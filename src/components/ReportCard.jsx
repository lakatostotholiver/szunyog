function formatDate(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportCard({ report }) {
  return (
    <div className="report-card">
      {report.photoURL && (
        <div className="report-card-photo">
          <img src={report.photoURL} alt="Gócpont fotó" loading="lazy" />
        </div>
      )}
      <div className="report-card-body">
        <p className="report-card-desc">{report.description}</p>
        <div className="report-card-meta">
          {report.reporterName && <span>{report.reporterName}</span>}
          <span>{formatDate(report.createdAt)}</span>
          {typeof report.lat === 'number' && typeof report.lng === 'number' && (
            <span>{report.lat.toFixed(5)}, {report.lng.toFixed(5)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
