"use client";

import { useEffect, useState } from "react";
import { fetchLatestMetrics, fetchSignals } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import type { MetricsSnapshot, Signal } from "@/lib/types";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { MetricsPanel } from "@/components/MetricsPanel";
import { PnlChart } from "@/components/PnlChart";
import { SignalsTable } from "@/components/SignalsTable";

function upsertSignal(signals: Signal[], incoming: Signal): Signal[] {
  const idx = signals.findIndex((s) => s.id === incoming.id);
  if (idx === -1) return [incoming, ...signals];
  const next = signals.slice();
  next[idx] = incoming;
  return next;
}

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      try {
        const [initialSignals, initialMetrics] = await Promise.all([
          fetchSignals(),
          fetchLatestMetrics(),
        ]);
        if (cancelled) return;
        setSignals(initialSignals);
        setMetrics(initialMetrics);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      }
    }

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onSignalEvent = (signal: Signal) =>
      setSignals((prev) => upsertSignal(prev, signal));
    const onMetricsEvent = (snapshot: MetricsSnapshot) => setMetrics(snapshot);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("signal.created", onSignalEvent);
    socket.on("signal.updated", onSignalEvent);
    socket.on("metrics.updated", onMetricsEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("signal.created", onSignalEvent);
      socket.off("signal.updated", onSignalEvent);
      socket.off("metrics.updated", onMetricsEvent);
    };
  }, []);

  const openCount = signals.filter(
    (s) => s.status === "OPENED" || s.status === "PENDING",
  ).length;
  const sortedSignals = [...signals].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          Terminal de copytrading
        </h1>
        <ConnectionBadge connected={connected} />
      </header>

      {error && (
        <p
          className="rounded-md border px-3 py-2 text-sm"
          style={{ borderColor: "var(--status-critical)", color: "var(--status-critical)" }}
        >
          {error}
        </p>
      )}

      <MetricsPanel metrics={metrics} openCount={openCount} />
      <PnlChart signals={signals} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-[var(--text-secondary)]">
          Señales
        </h2>
        <SignalsTable signals={sortedSignals} />
      </section>
    </main>
  );
}
