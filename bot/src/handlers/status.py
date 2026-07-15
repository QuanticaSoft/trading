import logging

from aiogram import Router
from aiogram.filters import Command, CommandObject
from aiogram.types import Message

from ..parsing import ArgParseError, parse_kv_args
from ..services.backend_client import BackendClient, BackendError

logger = logging.getLogger("bot.handlers.status")


def build_status_router(backend: BackendClient) -> Router:
    router = Router(name="status")

    @router.message(Command("status"))
    async def handle_status(message: Message, command: CommandObject) -> None:
        try:
            fields = parse_kv_args(command.args)
        except ArgParseError as exc:
            await message.answer(f"❌ {exc}\nUso: /status [SIGNAL_ID=<uuid>]")
            return

        signal_id = fields.get("signal_id")
        try:
            result = await backend.get_status(signal_id)
        except BackendError:
            logger.exception(
                "Failed to fetch status (signal_id=%s, chat_id=%s)",
                signal_id,
                message.chat.id,
            )
            await message.answer("⚠️ No se pudo consultar el estado, intenta de nuevo.")
            return

        await message.answer(f"📊 {result}")

    return router
