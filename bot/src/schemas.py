from decimal import Decimal, InvalidOperation
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

SYMBOL_PATTERN = r"^[A-Z0-9]{3,15}$"


class SignalPayload(BaseModel):
    symbol: str = Field(pattern=SYMBOL_PATTERN)
    side: Literal["BUY", "SELL"]
    entry: Decimal = Field(gt=0)
    stop_loss: Decimal | None = Field(default=None, gt=0)
    take_profit: list[Decimal] = Field(default_factory=list)
    source: str | None = Field(default=None, max_length=120)

    @field_validator("symbol", mode="before")
    @classmethod
    def _upper_symbol(cls, v: str) -> str:
        return v.upper() if isinstance(v, str) else v

    @field_validator("side", mode="before")
    @classmethod
    def _upper_side(cls, v: str) -> str:
        return v.upper() if isinstance(v, str) else v

    @field_validator("take_profit", mode="before")
    @classmethod
    def _split_take_profit(cls, v: object) -> object:
        if isinstance(v, str):
            try:
                return [Decimal(part) for part in v.split(",") if part]
            except InvalidOperation as exc:
                raise ValueError(f"Take profit inválido: {v!r}") from exc
        return v

    @field_validator("take_profit")
    @classmethod
    def _positive_take_profit(cls, v: list[Decimal]) -> list[Decimal]:
        if any(tp <= 0 for tp in v):
            raise ValueError("Todos los take profit deben ser > 0")
        return v


class TradePayload(BaseModel):
    signal_id: UUID
    status: Literal["OPENED", "CLOSED", "CANCELLED"]
    price: Decimal | None = Field(default=None, gt=0)
    pnl: Decimal | None = None

    @field_validator("status", mode="before")
    @classmethod
    def _upper_status(cls, v: str) -> str:
        return v.upper() if isinstance(v, str) else v
