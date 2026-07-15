import logging
from collections.abc import Awaitable, Callable
from typing import Any

from aiogram.types import Update

logger = logging.getLogger("bot.updates")


async def log_update_middleware(
    handler: Callable[[Update, dict[str, Any]], Awaitable[Any]],
    event: Update,
    data: dict[str, Any],
) -> Any:
    """Outer middleware logging only technical IDs.

    Never logs message text or payloads: they could carry values a user
    typed by mistake (a key, a seed phrase). Only IDs needed to correlate
    an update with backend/bot logs are recorded.
    """
    message = event.message
    logger.info(
        "update_id=%s chat_id=%s user_id=%s",
        event.update_id,
        message.chat.id if message else None,
        message.from_user.id if message and message.from_user else None,
    )
    return await handler(event, data)


def register_logging_middleware(dispatcher: Any) -> None:
    dispatcher.update.outer_middleware(log_update_middleware)
