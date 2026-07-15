export type SignalSide = 'BUY' | 'SELL';
export type SignalStatus = 'PENDING' | 'OPENED' | 'CLOSED' | 'CANCELLED';

export interface Signal {
  id: string;
  symbol: string;
  side: SignalSide;
  entry: string;
  stopLoss: string | null;
  takeProfit: string[];
  source: string | null;
  status: SignalStatus;
  executionPrice: string | null;
  pnl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MetricsSnapshot {
  generated_at: string;
  closed_trades: number;
  win_rate: number | null;
  total_pnl: number;
  average_pnl: number | null;
  max_drawdown: number;
  profit_factor: number | null;
}
