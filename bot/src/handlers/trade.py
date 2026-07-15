import logging

from aiogram import Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message
from pydantic import ValidationError

from ..parsing import ArgParseError, parse_kv_args
from ..schemas import TradePayload
from ..services.backend_client import BackendClient, BackendError

logger = logging.getLogger("bot.handlers.trade")

USAGE = "Uso: /trade SIGNAL_ID=<uuid> STATUS=OPENED|CLOSED|CANCELLED PRICE=1.0851"


def build_trade_router(backend: BackendClient) -> Router:
    router = Router(name="trade")

    @router.message(Command("trade"))
    async def handle_trade(message: Message, command: CommandObject) -> None:
        try:
            fields = parse_kv_args(command.args)
            payload = TradePayload.model_validate(
                {
                    "signal_id": fields.get("signal_id"),
                    "status": fields.get("status"),
                    "price": fields.get("price"),
                    "pnl": fields.get("pnl"),
                }
            )
        except (ArgParseError, ValidationError) as exc:
            logger.info("Rejected /trade from chat_id=%s: invalid payload", message.chat.id)
            await message.answer(f"❌ Reporte de trade inválido.\n{USAGE}\n\nDetalle: {exc}")
            return

        try:
            await backend.post_trade(payload.model_dump(mode="json"))
        except BackendError:
            logger.exception(
                "Failed to forward trade update for signal_id=%s (chat_id=%s)",
                payload.signal_id,
                message.chat.id,
            )
            await message.answer("⚠️ No se pudo registrar la actualización, intenta de nuevo.")
            return

        logger.info(
            "Trade update signal_id=%s status=%s registered (chat_id=%s)",
            payload.signal_id,
            payload.status,
            message.chat.id,
        )
        await message.answer(f"✅ Actualizado {payload.signal_id}: {payload.status}")

    return router
