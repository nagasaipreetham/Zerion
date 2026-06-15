import { useEffect, useState, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import './GitHubGraph.css';

/* ─── Config ──────────────────────────────────────────────────────────────────
 * VITE_API_BASE_URL is set in portfolio/.env → points to serverCommon backend.
 * Falls back to localhost:5000 for local dev.
 * ─────────────────────────────────────────────────────────────────────────── */
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/* Day-of-week labels. Index 0=Sun, 1=Mon … 6=Sat.
 * We only render text for Mon (1), Wed (3), Fri (5) — matching GitHub's display. */
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

/**
 * Maps a raw contribution count to one of 5 discrete intensity levels (0–4).
 * These levels drive the data-level CSS attribute, which controls cell colour
 * via the theme-sensitive CSS rules in GitHubGraph.css.
 */
function getLevel(count) {
  if (count === 0) return 0;
  if (count <= 2)  return 1;
  if (count <= 5)  return 2;
  if (count <= 10) return 3;
  return 4;
}

/**
 * Formats an ISO date string (e.g. "2025-07-04") into a readable label
 * like "Jul 4, 2025" — used in the hover tooltip.
 */
function formatDate(dateStr) {
  // Append T00:00:00 so the Date is treated as local midnight, not UTC midnight
  // which would shift the displayed date by one day in UTC+ timezones.
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day:   'numeric',
    year:  'numeric',
  });
}

/* ─── Component ────────────────────────────────────────────────────────────── */
export default function GitHubGraph() {
  const { theme } = useTheme();

  const [weeks, setWeeks]             = useState([]);          // weeks[] from /calendar
  const [totalCommits, setTotalCommits] = useState(null);       // from /stats
  const [loading, setLoading]         = useState(true);
  const [tooltip, setTooltip]         = useState(null);        // { date, count, x, y }


  /* ── Fetch data in parallel ─────────────────────────────────────────── */
  useEffect(() => {
    async function fetchData() {
      try {
        const [calRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/github/contributions/calendar`),
          fetch(`${API_BASE}/github/contributions/stats`),
        ]);

        const [calJson, statsJson] = await Promise.all([
          calRes.json(),
          statsRes.json(),
        ]);

        if (calJson.success)   setWeeks(calJson.data.weeks);
        if (statsJson.success) setTotalCommits(statsJson.data.totalCommits);
      } catch (err) {
        console.error('[GitHubGraph] Failed to fetch GitHub data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  /* ── Derive month-label positions ────────────────────────────────────── */
  const monthLabels = [];
  let lastMonth = -1;
  weeks.forEach((week, idx) => {
    const month = new Date(`${week.firstDay}T00:00:00`).getMonth();
    if (month !== lastMonth) {
      monthLabels.push({ label: MONTH_NAMES[month], weekIdx: idx });
      lastMonth = month;
    }
  });

  /* ── Tooltip handlers ───────────────────────────────────────────────── */
  const handleCellEnter = useCallback((e, day) => {
    setTooltip({
      date:  formatDate(day.date),
      count: day.contributionCount,
      x: e.clientX,
      y: e.clientY,
    });
  }, []);

  const handleCellMove = useCallback((e) => {
    setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  }, []);

  const handleCellLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  /* ── Render ─────────────────────────────────────────────────────────── */
  return (
    <section className="github-graph-section">

      {/* ── Section header ─────────────────────────────────────────────── */}
      <div className="graph-header">
        <span className="graph-section-label">GITHUB ACTIVITY</span>

        {totalCommits !== null && (
          <span className="graph-total-count">
            {totalCommits.toLocaleString()}
            <span className="graph-total-sub"> commits this year</span>
          </span>
        )}
      </div>

      {/* ── Loading skeleton ────────────────────────────────────────────── */}
      {loading && (
        <div className="graph-scroll-wrapper" aria-hidden="true">
          <div className="graph-skeleton-grid">
            {Array.from({ length: 53 }).map((_, wi) => (
              <div className="graph-skeleton-week" key={wi}>
                {Array.from({ length: 7 }).map((_, di) => (
                  <div className="graph-skeleton-cell" key={di} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main graph ──────────────────────────────────────────────────── */}
      {!loading && weeks.length > 0 && (
        <>
          <div className="graph-scroll-wrapper">
            <div className="graph-inner">

              {/* Month labels row */}
              <div className="graph-month-row">
                {/* Spacer aligns labels over the grid, not the day-label column */}
                <div className="graph-day-label-spacer" />
                <div
                  className="graph-month-labels"
                  style={{ width: `calc(${weeks.length} * var(--col-width))` }}
                >
                  {monthLabels.map(({ label, weekIdx }) => (
                    <span
                      key={`${label}-${weekIdx}`}
                      className="graph-month-label"
                      style={{ left: `calc(${weekIdx} * var(--col-width))` }}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Day labels + contribution grid */}
              <div className="graph-body-row">

                {/* Left: Mon / Wed / Fri row labels */}
                <div className="graph-day-labels" aria-hidden="true">
                  {DAY_LABELS.map((label, i) => (
                    <span key={i} className="graph-day-label">{label}</span>
                  ))}
                </div>

                {/* Right: The actual heatmap grid */}
                <div className="graph-grid" role="grid" aria-label="GitHub contribution heatmap">
                  {weeks.map((week, weekIdx) => {
                    /*
                     * Map each day into a fixed 7-slot array [Sun..Sat] using
                     * the `weekday` field so partial start/end weeks render
                     * correctly with transparent placeholder cells in the gaps.
                     */
                    const slots = new Array(7).fill(null);
                    week.contributionDays.forEach(day => {
                      slots[day.weekday] = day;
                    });

                    return (
                      <div className="graph-week" key={weekIdx} role="row">
                        {slots.map((day, dayIdx) =>
                          day ? (
                            <div
                              key={day.date}
                              role="gridcell"
                              className="graph-cell"
                              data-level={getLevel(day.contributionCount)}
                              aria-label={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
                              onMouseEnter={e => handleCellEnter(e, day)}
                              onMouseMove={handleCellMove}
                              onMouseLeave={handleCellLeave}
                            />
                          ) : (
                            /* Empty placeholder keeps the column aligned */
                            <div
                              key={`empty-${weekIdx}-${dayIdx}`}
                              className="graph-cell graph-cell--empty"
                              aria-hidden="true"
                            />
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Legend ───────────────────────────────────────────────────── */}
          <div className="graph-legend" aria-label="Contribution intensity legend">
            <span className="graph-legend-text">Less</span>
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="graph-cell graph-legend-cell"
                data-level={level}
                aria-hidden="true"
              />
            ))}
            <span className="graph-legend-text">More</span>
          </div>
        </>
      )}

      {/* ── Hover tooltip (fixed-positioned, follows cursor) ─────────────── */}
      {tooltip && (
        <div
          className="graph-tooltip"
          style={{
            left: tooltip.x + 14,
            top:  tooltip.y - 48,
          }}
          aria-hidden="true"
        >
          <strong className="graph-tooltip-count">
            {tooltip.count === 0
              ? 'No contributions'
              : `${tooltip.count} contribution${tooltip.count !== 1 ? 's' : ''}`}
          </strong>
          <span className="graph-tooltip-date">{tooltip.date}</span>
        </div>
      )}

    </section>
  );
}
