import type { MetricsSnapshot, Signal } from './types';

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export async function fetchSignals(limit = 200): Promise<Signal[]> {
  const res = await fetch(`${BACKEND_URL}/signals?limit=${limit}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`No se pudo cargar señales (${res.status})`);
  }
  return res.json();
}

export async function fetchLatestMetrics(): Promise<MetricsSnapshot | null> {
  const res = await fetch(`${BACKEND_URL}/metrics/latest`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`No se pudo cargar métricas (${res.status})`);
  }
  const body: unknown = await res.json();
  return (body ?? null) as MetricsSnapshot | null;
}
