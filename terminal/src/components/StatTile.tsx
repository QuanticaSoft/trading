type Tone = "default" | "good" | "critical";

const TONE_COLOR: Record<Tone, string> = {
  default: "var(--text-primary)",
  good: "var(--status-good)",
  critical: "var(--status-critical)",
};

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: Tone;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <span
        className="text-2xl font-semibold"
        style={{ color: TONE_COLOR[tone] }}
      >
        {value}
      </span>
    </div>
  );
}
