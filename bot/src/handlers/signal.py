import logging
from uuid import uuid4

from aiogram import Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message
from pydantic import ValidationError

from ..parsing import ArgParseError, parse_kv_args
from ..schemas import SignalPayload
from ..services.backend_client import BackendClient, BackendError

logger = logging.getLogger("bot.handlers.signal")

USAGE = (
    "Uso: /signal SYMBOL=EURUSD SIDE=BUY ENTRY=1.0850 SL=1.0800 "
    "TP=1.0900,1.0950"
)


def build_signal_router(backend: BackendClient) -> Router:
    router = Router(name="signal")

    @router.message(Command("signal"))
    async def handle_signal(message: Message, command: CommandObject) -> None:
        try:
            fields = parse_kv_args(command.args)
            payload = SignalPayload.model_validate(
                {
                    "symbol": fields.get("symbol"),
                    "side": fields.get("side"),
                    "entry": fields.get("entry"),
                    "stop_loss": fields.get("sl"),
                    "take_profit": fields.get("tp"),
                    "source": fields.get("source"),
                }
            )
        except (ArgParseError, ValidationError) as exc:
            logger.info("Rejected /signal from chat_id=%s: invalid payload", message.chat.id)
            await message.answer(f"❌ Señal inválida.\n{USAGE}\n\nDetalle: {exc}")
            return

        signal_id = uuid4()
        try:
            await backend.post_signal(
                {"signal_id": str(signal_id), **payload.model_dump(mode="json")}
            )
        except BackendError:
            logger.exception(
                "Failed to forward signal_id=%s to backend (chat_id=%s)",
                signal_id,
                message.chat.id,
            )
            await message.answer("⚠️ No se pudo registrar la señal, intenta de nuevo.")
            return

        logger.info("Signal signal_id=%s registered (chat_id=%s)", signal_id, message.chat.id)
        await message.answer(f"✅ Señal registrada: {signal_id}")

    return router
