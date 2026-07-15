"use client";

import type { Signal } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function formatNumber(value: string | null): string {
  if (value === null) return "—";
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(5).replace(/0+$/, "").replace(/\.$/, "") : value;
}

function pnlColor(pnl: string | null): string {
  if (pnl === null) return "var(--text-secondary)";
  return Number(pnl) >= 0 ? "var(--status-good)" : "var(--status-critical)";
}

export function SignalsTable({ signals }: { signals: Signal[] }) {
  if (signals.length === 0) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Todavía no hay señales.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--text-secondary)]">
            <th className="px-3 py-2 font-medium">Símbolo</th>
            <th className="px-3 py-2 font-medium">Lado</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2 text-right font-medium">Entrada</th>
            <th className="px-3 py-2 text-right font-medium">SL</th>
            <th className="px-3 py-2 text-right font-medium">Ejecución</th>
            <th className="px-3 py-2 text-right font-medium">PnL</th>
            <th className="px-3 py-2 font-medium">Actualizado</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal) => (
            <tr
              key={signal.id}
              className="border-b border-[var(--border)] last:border-0"
            >
              <td className="px-3 py-2 text-[var(--text-primary)]">
                {signal.symbol}
              </td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">
                {signal.side}
              </td>
              <td className="px-3 py-2">
                <StatusBadge signal={signal} />
              </td>
              <td
                className="px-3 py-2 text-right text-[var(--text-primary)]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatNumber(signal.entry)}
              </td>
              <td
                className="px-3 py-2 text-right text-[var(--text-secondary)]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatNumber(signal.stopLoss)}
              </td>
              <td
                className="px-3 py-2 text-right text-[var(--text-secondary)]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatNumber(signal.executionPrice)}
              </td>
              <td
                className="px-3 py-2 text-right"
                style={{
                  fontVariantNumeric: "tabular-nums",
                  color: pnlColor(signal.pnl),
                }}
              >
                {formatNumber(signal.pnl)}
              </td>
              <td className="px-3 py-2 text-[var(--text-secondary)]">
                {new Date(signal.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
