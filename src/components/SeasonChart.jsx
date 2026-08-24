import { useState } from 'react';

const COLOR = {
  clean: '#15803d',
  dry: '#9ca3af',
  treated: '#dc2626',
};

const LABEL = {
  clean: 'Tiszta',
  dry: 'Száraz',
  treated: 'Kezelve',
};

function shortDate(dateStr) {
  return `${dateStr.slice(5, 7)}.${dateStr.slice(8, 10)}.`;
}

function longDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
}

const PAD_L = 28;
const PAD_R = 12;
const PAD_T = 28;
const PAD_B = 34;
const BAND = 46;
const BAR_W = 20;
const PLOT_H = 160;

export function SeasonStatusChart({ measurements, totalSites, className = '' }) {
  const [hover, setHover] = useState(null);
  const rows = [...measurements].reverse();
  const width = PAD_L + PAD_R + rows.length * BAND;
  const height = PAD_T + PLOT_H + PAD_B;
  const scaleY = (v) => PLOT_H - (v / totalSites) * PLOT_H;

  return (
    <div className={`chart-card${className ? ` ${className}` : ''}`}>
      <div className="chart-card-head">
        <h3>Helyszínek állapota mérésenként</h3>
        <div className="chart-legend">
          {['clean', 'dry', 'treated'].map((k) => (
            <span className="chart-legend-item" key={k}>
              <span className="chart-legend-dot" style={{ background: COLOR[k] }} />
              {LABEL[k]}
            </span>
          ))}
        </div>
      </div>
      <div className="chart-svg-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="season-chart" role="img" aria-label="Helyszínek állapota mérésenként, tiszta, száraz és kezelt bontásban">
          {[0, totalSites].map((tick) => (
            <g key={tick}>
              <line
                x1={PAD_L}
                x2={width - PAD_R}
                y1={PAD_T + scaleY(tick)}
                y2={PAD_T + scaleY(tick)}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text x={PAD_L - 8} y={PAD_T + scaleY(tick) + 3} textAnchor="end" className="chart-axis-label">
                {tick}
              </text>
            </g>
          ))}

          {rows.map((m, i) => {
            const counts = { clean: 0, dry: 0, treated: 0 };
            m.results.forEach((r) => {
              if (counts[r.status] !== undefined) counts[r.status] += 1;
            });
            const cx = PAD_L + i * BAND + BAND / 2;
            let cursor = 0;
            const order = ['clean', 'dry', 'treated'];
            const segments = order
              .map((key, idx) => {
                const count = counts[key];
                if (count <= 0) return null;
                const isLast = order.slice(idx + 1).every((k) => counts[k] <= 0);
                const isFirst = cursor === 0;
                const gapTop = isLast ? 0 : 1;
                const y0 = scaleY(cursor + count) + gapTop;
                const y1 = scaleY(cursor);
                cursor += count;
                return { key, count, y0, y1, isLast, isFirst };
              })
              .filter(Boolean);

            const isHovered = hover === i;

            return (
              <g key={m.surveyDate}>
                {segments.map((seg) => (
                  <rect
                    key={seg.key}
                    x={cx - BAR_W / 2}
                    y={PAD_T + seg.y0}
                    width={BAR_W}
                    height={Math.max(seg.y1 - seg.y0, 0)}
                    rx={seg.isLast ? 4 : 0}
                    fill={COLOR[seg.key]}
                    opacity={isHovered ? 1 : 0.92}
                  />
                ))}
                {counts.treated > 0 && (
                  <text
                    x={cx}
                    y={PAD_T + scaleY(cursor) - 6}
                    textAnchor="middle"
                    className="chart-value-label"
                  >
                    {counts.treated}
                  </text>
                )}
                <text x={cx} y={PAD_T + PLOT_H + 18} textAnchor="middle" className="chart-axis-label">
                  {shortDate(m.surveyDate)}
                </text>
                <rect
                  x={cx - BAND / 2}
                  y={PAD_T - 10}
                  width={BAND}
                  height={PLOT_H + 10}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${longDate(m.surveyDate)}: ${counts.clean} tiszta, ${counts.dry} száraz, ${counts.treated} kezelt helyszín`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  style={{ cursor: 'pointer' }}
                />
                {isHovered && (
                  <g pointerEvents="none">
                    <rect
                      x={Math.min(Math.max(cx - 58, PAD_L), width - PAD_R - 116)}
                      y={PAD_T - 6}
                      width={116}
                      height={54}
                      rx={4}
                      fill="var(--brand-dark)"
                    />
                    <text
                      x={Math.min(Math.max(cx - 58, PAD_L), width - PAD_R - 116) + 8}
                      y={PAD_T + 10}
                      className="chart-tooltip-title"
                    >
                      {longDate(m.surveyDate)}
                    </text>
                    <text
                      x={Math.min(Math.max(cx - 58, PAD_L), width - PAD_R - 116) + 8}
                      y={PAD_T + 26}
                      className="chart-tooltip-row"
                    >
                      Tiszta {counts.clean} · Száraz {counts.dry}
                    </text>
                    <text
                      x={Math.min(Math.max(cx - 58, PAD_L), width - PAD_R - 116) + 8}
                      y={PAD_T + 41}
                      className="chart-tooltip-row"
                    >
                      Kezelve {counts.treated} helyszín
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="table-hint">Görgessen jobbra a korábbi mérésekért · a teljes bontás lent, mérésenként is megtekinthető</p>
    </div>
  );
}

export function SeasonLarvaeChart({ measurements, className = '' }) {
  const [hover, setHover] = useState(null);
  const rows = [...measurements].reverse();
  const totals = rows.map((m) => m.results.reduce((sum, r) => sum + r.larvae, 0));
  const max = Math.max(...totals, 1);
  const yMax = Math.ceil(max * 1.2) || 1;
  const width = PAD_L + PAD_R + rows.length * BAND;
  const height = PAD_T + PLOT_H + PAD_B;
  const scaleY = (v) => PLOT_H - (v / yMax) * PLOT_H;

  const points = rows.map((m, i) => ({
    x: PAD_L + i * BAND + BAND / 2,
    y: PAD_T + scaleY(totals[i]),
    total: totals[i],
    date: m.surveyDate,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className={`chart-card${className ? ` ${className}` : ''}`}>
      <div className="chart-card-head">
        <h3>Összes lárva mérésenként (db / 0,5 l, minden helyszín összesítve)</h3>
      </div>
      <div className="chart-svg-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="season-chart" role="img" aria-label="Összes lárva mérésenként">
          {[0, Math.round(yMax / 2), yMax].map((tick) => (
            <g key={tick}>
              <line x1={PAD_L} x2={width - PAD_R} y1={PAD_T + scaleY(tick)} y2={PAD_T + scaleY(tick)} stroke="var(--border)" strokeWidth="1" />
              <text x={PAD_L - 8} y={PAD_T + scaleY(tick) + 3} textAnchor="end" className="chart-axis-label">{tick}</text>
            </g>
          ))}

          <path d={path} fill="none" stroke={COLOR.treated} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {hover !== null && (
            <line x1={points[hover].x} x2={points[hover].x} y1={PAD_T} y2={PAD_T + PLOT_H} stroke="var(--muted)" strokeWidth="1" />
          )}

          {points.map((p, i) => (
            <g key={p.date}>
              <circle cx={p.x} cy={p.y} r={6} fill="var(--bg)" />
              <circle cx={p.x} cy={p.y} r={4} fill={COLOR.treated} />
              {i === points.length - 1 && (
                <text x={p.x} y={p.y - 12} textAnchor="middle" className="chart-value-label">{p.total}</text>
              )}
              <text x={p.x} y={PAD_T + PLOT_H + 18} textAnchor="middle" className="chart-axis-label">{shortDate(p.date)}</text>
              <rect
                x={p.x - BAND / 2}
                y={PAD_T - 10}
                width={BAND}
                height={PLOT_H + 10}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${longDate(p.date)}: ${p.total} lárva összesen`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                style={{ cursor: 'pointer' }}
              />
              {hover === i && (
                <g pointerEvents="none">
                  <rect
                    x={Math.min(Math.max(p.x - 52, PAD_L), width - PAD_R - 104)}
                    y={PAD_T - 6}
                    width={104}
                    height={38}
                    rx={4}
                    fill="var(--brand-dark)"
                  />
                  <text x={Math.min(Math.max(p.x - 52, PAD_L), width - PAD_R - 104) + 8} y={PAD_T + 10} className="chart-tooltip-title">
                    {longDate(p.date)}
                  </text>
                  <text x={Math.min(Math.max(p.x - 52, PAD_L), width - PAD_R - 104) + 8} y={PAD_T + 26} className="chart-tooltip-row">
                    {p.total} lárva / 0,5 l összesen
                  </text>
                </g>
              )}
            </g>
          ))}
        </svg>
      </div>
      <p className="table-hint">Görgessen jobbra a korábbi mérésekért</p>
    </div>
  );
}
