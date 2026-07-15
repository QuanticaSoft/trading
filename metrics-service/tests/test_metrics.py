import pandas as pd

from src.metrics import compute_summary


def _df(pnls: list[float]) -> pd.DataFrame:
    return pd.DataFrame({"pnl": pnls})


def test_empty_dataframe_returns_zeroed_summary():
    summary = compute_summary(_df([]))
    assert summary["closed_trades"] == 0
    assert summary["win_rate"] is None
    assert summary["profit_factor"] is None
    assert summary["total_pnl"] == 0.0


def test_all_winning_trades_has_no_profit_factor_denominator():
    summary = compute_summary(_df([10, 20, 30]))
    assert summary["closed_trades"] == 3
    assert summary["win_rate"] == 1.0
    assert summary["total_pnl"] == 60.0
    assert summary["average_pnl"] == 20.0
    assert summary["max_drawdown"] == 0.0
    assert summary["profit_factor"] is None


def test_mixed_trades_computes_win_rate_and_profit_factor():
    summary = compute_summary(_df([10, -5, 15, -10]))
    assert summary["closed_trades"] == 4
    assert summary["win_rate"] == 0.5
    assert summary["total_pnl"] == 10.0
    # gross_profit=25, gross_loss=15 -> profit_factor = 25/15
    assert round(summary["profit_factor"], 4) == round(25 / 15, 4)


def test_max_drawdown_measures_worst_peak_to_trough_drop():
    # cumulative: 100, 150, 90, 120 -> peak 150, trough 90 -> drawdown 60
    summary = compute_summary(_df([100, 50, -60, 30]))
    assert summary["max_drawdown"] == 60.0


def test_rows_with_null_pnl_are_ignored():
    df = pd.DataFrame({"pnl": [10, None, 20]})
    summary = compute_summary(df)
    assert summary["closed_trades"] == 2
    assert summary["total_pnl"] == 30.0
