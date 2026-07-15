from datetime import datetime, timezone

import pandas as pd

EMPTY_SUMMARY = {
    "closed_trades": 0,
    "win_rate": None,
    "total_pnl": 0.0,
    "average_pnl": None,
    "max_drawdown": 0.0,
    "profit_factor": None,
}


def compute_summary(closed_signals: pd.DataFrame) -> dict:
    """Performance metrics from closed signals ordered by close time.

    Only uses fields we actually store (pnl per closed signal). Indicator
    libraries like `ta` need an OHLC price feed we don't ingest yet — see
    the metrics-service README for that limitation.
    """
    if closed_signals.empty:
        return dict(EMPTY_SUMMARY)

    pnl = pd.to_numeric(closed_signals["pnl"], errors="coerce").astype(float)
    pnl = pnl.dropna()
    if pnl.empty:
        return dict(EMPTY_SUMMARY)

    wins = pnl[pnl > 0]
    losses = pnl[pnl < 0]

    cumulative = pnl.cumsum()
    running_max = cumulative.cummax()
    drawdown = running_max - cumulative
    max_drawdown = float(drawdown.max())

    gross_profit = float(wins.sum())
    gross_loss = float(-losses.sum())
    profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else None

    return {
        "closed_trades": int(len(pnl)),
        "win_rate": float(len(wins) / len(pnl)),
        "total_pnl": float(pnl.sum()),
        "average_pnl": float(pnl.mean()),
        "max_drawdown": max_drawdown,
        "profit_factor": profit_factor,
    }


def build_snapshot(closed_signals: pd.DataFrame) -> dict:
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        **compute_summary(closed_signals),
    }
