import asyncio
import logging
import sys

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from dotenv import load_dotenv

from .config import Settings
from .handlers import build_root_router
from .middlewares.logging import register_logging_middleware
from .services.backend_client import BackendClient


async def main() -> None:
    load_dotenv()
    settings = Settings.from_env()

    bot = Bot(
        token=settings.bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dispatcher = Dispatcher()
    register_logging_middleware(dispatcher)

    backend = BackendClient(settings.backend_url, settings.backend_webhook_secret)
    dispatcher.include_router(build_root_router(backend))

    await dispatcher.start_polling(bot)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, stream=sys.stdout)
    asyncio.run(main())
