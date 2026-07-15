export function ConnectionBadge({ connected }: { connected: boolean }) {
  const color = connected ? "var(--status-good)" : "var(--status-critical)";
  const label = connected ? "Conectado" : "Desconectado";
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
    </span>
  );
}
