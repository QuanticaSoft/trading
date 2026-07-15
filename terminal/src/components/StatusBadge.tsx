import type { Signal } from "@/lib/types";

function presentation(signal: Signal): { color: string; label: string } {
  switch (signal.status) {
    case "PENDING":
      return { color: "var(--text-muted)", label: "Pendiente" };
    case "OPENED":
      return { color: "var(--status-warning)", label: "Abierta" };
    case "CANCELLED":
      return { color: "var(--text-muted)", label: "Cancelada" };
    case "CLOSED": {
      const pnl = signal.pnl !== null ? Number(signal.pnl) : 0;
      return pnl >= 0
        ? { color: "var(--status-good)", label: "Cerrada (ganancia)" }
        : { color: "var(--status-critical)", label: "Cerrada (pérdida)" };
    }
  }
}

// Status is never color-alone: a dot plus a text label, per the fixed
// status palette (good/warning/serious/critical never carries meaning
// without an accompanying label).
export function StatusBadge({ signal }: { signal: Signal }) {
  const { color, label } = presentation(signal);
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span style={{ color: "var(--text-primary)" }}>{label}</span>
    </span>
  );
}
