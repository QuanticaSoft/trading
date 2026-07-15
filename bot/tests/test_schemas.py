from decimal import Decimal

import pytest
from pydantic import ValidationError

from src.schemas import SignalPayload, TradePayload


def test_valid_signal_with_multiple_take_profit():
    payload = SignalPayload.model_validate(
        {
            "symbol": "eurusd",
            "side": "buy",
            "entry": "1.0850",
            "stop_loss": "1.0800",
            "take_profit": "1.0900,1.0950",
        }
    )
    assert payload.symbol == "EURUSD"
    assert payload.side == "BUY"
    assert payload.take_profit == [Decimal("1.0900"), Decimal("1.0950")]


def test_signal_without_optional_fields():
    payload = SignalPayload.model_validate({"symbol": "BTCUSDT", "side": "SELL", "entry": "65000"})
    assert payload.stop_loss is None
    assert payload.take_profit == []


@pytest.mark.parametrize(
    "fields",
    [
        {"symbol": "eu", "side": "BUY", "entry": "1.0850"},  # symbol too short
        {"symbol": "EURUSD", "side": "HOLD", "entry": "1.0850"},  # invalid side
        {"symbol": "EURUSD", "side": "BUY", "entry": "-1"},  # entry must be > 0
        {"symbol": "EURUSD", "side": "BUY", "entry": "1.0850", "take_profit": "0"},
    ],
)
def test_rejects_invalid_signal(fields):
    with pytest.raises(ValidationError):
        SignalPayload.model_validate(fields)


def test_valid_trade_payload():
    payload = TradePayload.model_validate(
        {
            "signal_id": "12345678-1234-5678-1234-567812345678",
            "status": "opened",
            "price": "1.0851",
        }
    )
    assert payload.status == "OPENED"


def test_rejects_trade_with_invalid_status():
    with pytest.raises(ValidationError):
        TradePayload.model_validate(
            {"signal_id": "12345678-1234-5678-1234-567812345678", "status": "MAYBE"}
        )
