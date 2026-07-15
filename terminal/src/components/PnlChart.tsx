"use client";

import { useMemo, useState, type MouseEvent } from "react";
import type { Signal } from "@/lib/types";

interface Point {
  id: string;
  date: string;
  pnl: number;
  cumulative: number;
}

function buildSeries(signals: Signal[]): Point[] {
  const closed = signals
    .filter((s) => s.status === "CLOSED" && s.pnl !== null)
    .slice()
    .sort(
      (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );

  let running = 0;
  return closed.map((s) => {
    const pnl = Number(s.pnl);
    running += pnl;
    return { id: s.id, date: s.updatedAt, pnl, cumulative: running };
  });
}

const WIDTH = 640;
const HEIGHT = 200;
const PADDING = { top: 16, right: 56, bottom: 16, left: 16 };

export function PnlChart({ signals }: { signals: Signal[] }) {
  const points = useMemo(() => buildSeries(signals), [signals]);
  const [showTable, setShowTable] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const values = points.map((p) => p.cumulative);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = maxValue - minValue || 1;

  const xFor = (i: number) =>
    PADDING.left +
    (points.length === 1 ? plotWidth / 2 : (i / (points.length - 1)) * plotWidth);
  const yFor = (v: number) =>
    PADDING.top + plotHeight - ((v - minValue) / range) * plotHeight;

  function handleMove(e: MouseEvent<SVGSVGElement>) {
    if (points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = points.length === 1 ? 0 : (x - PADDING.left) / plotWidth;
    const idx = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(Math.max(idx, 0), points.length - 1));
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--text-primary)]">
          PnL acumulado
        </h3>
        {points.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="text-xs text-[var(--text-secondary)] underline decoration-dotted"
          >
            {showTable ? "Ver gráfico" : "Ver tabla"}
          </button>
        )}
      </div>

      {points.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)]">
          Todavía no hay operaciones cerradas para graficar.
        </p>
      ) : showTable ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-secondary)]">
                <th className="px-2 py-1 font-medium">Fecha</th>
                <th className="px-2 py-1 text-right font-medium">PnL</th>
                <th className="px-2 py-1 text-right font-medium">Acumulado</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.id} className="border-t border-[var(--border)]">
                  <td className="px-2 py-1 text-[var(--text-secondary)]">
                    {new Date(p.date).toLocaleString()}
                  </td>
                  <td
                    className="px-2 py-1 text-right"
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: p.pnl >= 0 ? "var(--status-good)" : "var(--status-critical)",
                    }}
                  >
                    {p.pnl.toFixed(2)}
                  </td>
                  <td
                    className="px-2 py-1 text-right text-[var(--text-primary)]"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {p.cumulative.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-auto w-full"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
            role="img"
            aria-label="PnL acumulado a lo largo del tiempo"
          >
            <line
              x1={PADDING.left}
              y1={yFor(0)}
              x2={WIDTH - PADDING.right}
              y2={yFor(0)}
              stroke="var(--baseline)"
              strokeWidth={1}
            />
            <path
              d={points
                .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(i)} ${yFor(p.cumulative)}`)
                .join(" ")}
              fill="none"
              stroke="var(--series-1)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={xFor(points.length - 1)}
              cy={yFor(points[points.length - 1].cumulative)}
              r={4}
              fill="var(--series-1)"
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
            <text
              x={xFor(points.length - 1) + 8}
              y={yFor(points[points.length - 1].cumulative)}
              dominantBaseline="middle"
              fontSize={12}
              fill="var(--text-primary)"
            >
              {points[points.length - 1].cumulative.toFixed(2)}
            </text>

            {hoverIndex !== null && (
              <>
                <line
                  x1={xFor(hoverIndex)}
                  y1={PADDING.top}
                  x2={xFor(hoverIndex)}
                  y2={HEIGHT - PADDING.bottom}
                  stroke="var(--grid)"
                  strokeWidth={1}
                />
                <circle
                  cx={xFor(hoverIndex)}
                  cy={yFor(points[hoverIndex].cumulative)}
                  r={4}
                  fill="var(--series-1)"
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                />
              </>
            )}
          </svg>

          <div className="mt-2 h-4 text-xs text-[var(--text-secondary)]">
            {hoverIndex !== null &&
              `${new Date(points[hoverIndex].date).toLocaleString()} · PnL ${points[hoverIndex].pnl.toFixed(2)} · Acumulado ${points[hoverIndex].cumulative.toFixed(2)}`}
          </div>
        </>
      )}
    </div>
  );
}
