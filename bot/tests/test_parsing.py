import pytest

from src.parsing import ArgParseError, parse_kv_args


def test_parses_multiple_kv_pairs():
    assert parse_kv_args("SYMBOL=EURUSD SIDE=BUY ENTRY=1.0850") == {
        "symbol": "EURUSD",
        "side": "BUY",
        "entry": "1.0850",
    }


def test_empty_args_returns_empty_dict():
    assert parse_kv_args(None) == {}
    assert parse_kv_args("") == {}


def test_rejects_token_without_equals():
    with pytest.raises(ArgParseError):
        parse_kv_args("SYMBOL=EURUSD BUY")


def test_keys_are_case_insensitive():
    assert parse_kv_args("Symbol=EURUSD")["symbol"] == "EURUSD"
