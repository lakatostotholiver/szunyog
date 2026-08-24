import { useState, useRef, useLayoutEffect } from 'react';

// Státusz-paletta: a Mérések oldal badge-eivel azonos színek, hogy ugyanaz az
// adat a grafikonon és a táblázatban is ugyanúgy nézzen ki.
// Ellenőrizve: kontraszt >= 3:1 a világos háttéren, CVD ΔE 11,9 (protan/tritan).
const COLOR = {
  clean: '#166534',
  dry: '#6b7280',
  treated: '#991b1b',
};

const LABEL = {
  clean: 'Tiszta',
  dry: 'Száraz',
  treated: 'Kezelve',
};

const PAD_L = 36;
const PAD_R = 16;
const PAD_T = 14;
const PAD_B = 28;
const PLOT_H = 190;
const BAR_MAX = 24; // a jelölő soha nem tölti ki a sávot – marad levegő
const GAP = 2; // felület-rés a stack szegmensei között

function shortDate(dateStr) {
  return `${dateStr.slice(5, 7)}.${dateStr.slice(8, 10)}.`;
}

function longDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('hu-HU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// A grafikon a tényleges konténerszélességgel rajzolódik (1 SVG-egység = 1 px),
// így nincs belső vízszintes görgetés, és a feliratok minden méretben élesek.
// 0-ról indul és csak mérés után rajzolunk – így egy túl széles kezdeti érték
// nem feszítheti szét az oldalt kis kijelzőn.
function useElementWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const measure = (w) => setWidth(w > 0 ? w : 0);
    measure(el.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => measure(entries[0].contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return width;
}

// Felső élén lekerekített oszlop, az alapvonalnál szögletes.
function topRoundedBar(x, y, w, h, r = 4) {
  const rr = Math.max(0, Math.min(r, w / 2, h));
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    `L ${x + w - rr} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `L ${x + w} ${y + h}`,
    'Z',
  ].join(' ');
}

function niceTicks(max, count = 4) {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const ticks = [];
  for (let v = 0; v <= max + step / 2; v += step) ticks.push(Math.round(v));
  return ticks;
}

// A státusz-grafikon skálája pontosan a helyszínek számáig tart, ezért a felső
// osztás maga a teljes darabszám – nem lóghat a rajzterület fölé.
function ticksUpTo(max) {
  return [...niceTicks(max).filter((t) => t < max), max];
}

// Sűrű adatsornál nem fér ki minden dátum – ritkítunk, de az utolsó mindig látszik.
function labelStep(band, minPx = 38) {
  return Math.max(1, Math.ceil(minPx / Math.max(band, 1)));
}

function ChartTooltip({ x, plotWidth, title, rows }) {
  const clamped = Math.min(Math.max(x, 90), Math.max(plotWidth - 90, 90));
  return (
    <div className="chart-tooltip" style={{ left: `${clamped}px` }} role="presentation">
      <p className="chart-tooltip-date">{title}</p>
      {rows.map((row) => (
        <p className="chart-tooltip-line" key={row.label}>
          {row.color && <span className="chart-tooltip-swatch" style={{ background: row.color }} />}
          <span>{row.label}</span>
          <strong>{row.value}</strong>
        </p>
      ))}
    </div>
  );
}

function ChartFrame({ title, subtitle, legend, children, wrapRef, height, className = '' }) {
  return (
    <div className={`chart-card${className ? ` ${className}` : ''}`}>
      <div className="chart-card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="chart-card-sub">{subtitle}</p>}
        </div>
        {legend}
      </div>
      <div className="chart-plot" ref={wrapRef} style={{ height: `${height}px` }}>
        {children}
      </div>
    </div>
  );
}

export function SeasonStatusChart({ measurements, totalSites, className = '' }) {
  const wrapRef = useRef(null);
  const width = useElementWidth(wrapRef);
  const [hover, setHover] = useState(null);

  const rows = [...measurements].reverse();
  const height = PAD_T + PLOT_H + PAD_B;
  const plotW = Math.max(width - PAD_L - PAD_R, 80);
  const band = plotW / Math.max(rows.length, 1);
  const barW = Math.max(Math.min(BAR_MAX, band * 0.55), 3);
  const scaleY = (v) => PLOT_H - (v / totalSites) * PLOT_H;
  const step = labelStep(band);

  const order = ['clean', 'dry', 'treated'];
  const hovered = hover === null ? null : rows[hover];
  const hoveredCounts = hovered
    ? order.reduce((acc, k) => ({ ...acc, [k]: hovered.results.filter((r) => r.status === k).length }), {})
    : null;

  return (
    <ChartFrame
      title="Helyszínek állapota mérésenként"
      subtitle={`Mind a ${totalSites} mintavételi pont megoszlása, bejárásonként`}
      height={height}
      wrapRef={wrapRef}
      className={className}
      legend={
        <div className="chart-legend">
          {order.map((k) => (
            <span className="chart-legend-item" key={k}>
              <span className="chart-legend-dot" style={{ background: COLOR[k] }} />
              {LABEL[k]}
            </span>
          ))}
        </div>
      }
    >
      {width > 0 && (
      <svg
        width={width}
        height={height}
        className="season-chart"
        role="img"
        aria-label="Helyszínek állapota mérésenként, tiszta, száraz és kezelt bontásban"
      >
        {ticksUpTo(totalSites).map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_L}
              x2={width - PAD_R}
              y1={PAD_T + scaleY(tick)}
              y2={PAD_T + scaleY(tick)}
              className="chart-grid-line"
            />
            <text x={PAD_L - 10} y={PAD_T + scaleY(tick) + 4} textAnchor="end" className="chart-axis-label">
              {tick}
            </text>
          </g>
        ))}

        {rows.map((m, i) => {
          const counts = order.reduce(
            (acc, k) => ({ ...acc, [k]: m.results.filter((r) => r.status === k).length }),
            {}
          );
          const cx = PAD_L + band * (i + 0.5);
          const isHovered = hover === i;
          const showLabel = (rows.length - 1 - i) % step === 0;

          let cursor = 0;
          const segments = order
            .map((key) => {
              const count = counts[key];
              if (count <= 0) return null;
              const y0 = scaleY(cursor + count);
              const y1 = scaleY(cursor);
              cursor += count;
              return { key, count, y0, y1 };
            })
            .filter(Boolean);

          return (
            <g key={m.surveyDate}>
              {segments.map((seg, idx) => {
                const isTop = idx === segments.length - 1;
                const gap = isTop ? 0 : GAP;
                const y = PAD_T + seg.y0;
                const h = Math.max(seg.y1 - seg.y0 - gap, 0.5);
                const common = {
                  fill: COLOR[seg.key],
                  opacity: hover === null || isHovered ? 1 : 0.45,
                  style: { transition: 'opacity .15s ease' },
                };
                return isTop ? (
                  <path key={seg.key} d={topRoundedBar(cx - barW / 2, y, barW, h)} {...common} />
                ) : (
                  <rect key={seg.key} x={cx - barW / 2} y={y} width={barW} height={h} {...common} />
                );
              })}

              {showLabel && (
                <text x={cx} y={PAD_T + PLOT_H + 18} textAnchor="middle" className="chart-axis-label">
                  {shortDate(m.surveyDate)}
                </text>
              )}

              <rect
                x={cx - band / 2}
                y={PAD_T}
                width={band}
                height={PLOT_H}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${longDate(m.surveyDate)}: ${counts.clean} tiszta, ${counts.dry} száraz, ${counts.treated} kezelt helyszín`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="chart-hit"
              />
            </g>
          );
        })}
      </svg>
      )}

      {hovered && (
        <ChartTooltip
          x={PAD_L + band * (hover + 0.5)}
          plotWidth={width}
          title={longDate(hovered.surveyDate)}
          rows={order.map((k) => ({ label: LABEL[k], value: hoveredCounts[k], color: COLOR[k] }))}
        />
      )}
    </ChartFrame>
  );
}

export function SeasonLarvaeChart({ measurements, className = '' }) {
  const wrapRef = useRef(null);
  const width = useElementWidth(wrapRef);
  const [hover, setHover] = useState(null);

  const rows = [...measurements].reverse();
  const totals = rows.map((m) => m.results.reduce((sum, r) => sum + r.larvae, 0));
  const peak = Math.max(...totals, 1);
  const ticks = niceTicks(peak);
  const yMax = ticks[ticks.length - 1] || 1;

  const height = PAD_T + PLOT_H + PAD_B;
  const plotW = Math.max(width - PAD_L - PAD_R, 80);
  const band = plotW / Math.max(rows.length, 1);
  const scaleY = (v) => PLOT_H - (v / yMax) * PLOT_H;
  const step = labelStep(band);
  const peakIndex = totals.indexOf(peak);

  const points = rows.map((m, i) => ({
    x: PAD_L + band * (i + 0.5),
    y: PAD_T + scaleY(totals[i]),
    total: totals[i],
    date: m.surveyDate,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = points.length
    ? `${path} L ${points[points.length - 1].x} ${PAD_T + PLOT_H} L ${points[0].x} ${PAD_T + PLOT_H} Z`
    : '';

  return (
    <ChartFrame
      title="Összes lárva mérésenként"
      subtitle="Minden helyszín összesítve, db / 0,5 liter merítés"
      height={height}
      wrapRef={wrapRef}
      className={className}
    >
      {width > 0 && (
      <svg
        width={width}
        height={height}
        className="season-chart"
        role="img"
        aria-label="Összes lárva mérésenként, minden helyszín összesítve"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD_L}
              x2={width - PAD_R}
              y1={PAD_T + scaleY(tick)}
              y2={PAD_T + scaleY(tick)}
              className="chart-grid-line"
            />
            <text x={PAD_L - 10} y={PAD_T + scaleY(tick) + 4} textAnchor="end" className="chart-axis-label">
              {tick}
            </text>
          </g>
        ))}

        <path d={area} fill={COLOR.treated} opacity="0.1" />
        <path
          d={path}
          fill="none"
          stroke={COLOR.treated}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {hover !== null && (
          <line
            x1={points[hover].x}
            x2={points[hover].x}
            y1={PAD_T}
            y2={PAD_T + PLOT_H}
            className="chart-crosshair"
          />
        )}

        {points.map((p, i) => {
          const isHovered = hover === i;
          const showLabel = (points.length - 1 - i) % step === 0;
          // Csak a csúcsot és az utolsó mérést címkézzük – nem minden pontot.
          const showValue = i === peakIndex || i === points.length - 1;

          return (
            <g key={p.date}>
              {(isHovered || showValue) && (
                <>
                  <circle cx={p.x} cy={p.y} r={5} className="chart-dot-ring" />
                  <circle cx={p.x} cy={p.y} r={3.5} fill={COLOR.treated} />
                </>
              )}
              {showValue && p.total > 0 && (
                <text x={p.x} y={p.y - 12} textAnchor="middle" className="chart-value-label">
                  {p.total}
                </text>
              )}
              {showLabel && (
                <text x={p.x} y={PAD_T + PLOT_H + 18} textAnchor="middle" className="chart-axis-label">
                  {shortDate(p.date)}
                </text>
              )}
              <rect
                x={p.x - band / 2}
                y={PAD_T}
                width={band}
                height={PLOT_H}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${longDate(p.date)}: ${p.total} lárva összesen`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="chart-hit"
              />
            </g>
          );
        })}
      </svg>
      )}

      {hover !== null && (
        <ChartTooltip
          x={points[hover].x}
          plotWidth={width}
          title={longDate(points[hover].date)}
          rows={[{ label: 'Lárva összesen', value: `${points[hover].total} db / 0,5 l` }]}
        />
      )}
    </ChartFrame>
  );
}
