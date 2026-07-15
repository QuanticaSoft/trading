import type { MetricsSnapshot } from "@/lib/types";
import { StatTile } from "./StatTile";

function pct(v: number | null): string {
  return v === null ? "—" : `${(v * 100).toFixed(1)}%`;
}

function money(v: number | null): string {
  return v === null ? "—" : v.toFixed(2);
}

export function MetricsPanel({
  metrics,
  openCount,
}: {
  metrics: MetricsSnapshot | null;
  openCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatTile label="Posiciones abiertas" value={String(openCount)} />
      <StatTile label="Win rate" value={metrics ? pct(metrics.win_rate) : "—"} />
      <StatTile
        label="PnL total"
        value={metrics ? money(metrics.total_pnl) : "—"}
        tone={metrics ? (metrics.total_pnl >= 0 ? "good" : "critical") : "default"}
      />
      <StatTile
        label="Max drawdown"
        value={metrics ? money(metrics.max_drawdown) : "—"}
        tone={metrics && metrics.max_drawdown > 0 ? "critical" : "default"}
      />
      <StatTile
        label="Profit factor"
        value={metrics ? (metrics.profit_factor?.toFixed(2) ?? "—") : "—"}
      />
    </div>
  );
}
