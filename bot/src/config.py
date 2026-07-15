import os
from dataclasses import dataclass


class MissingConfigError(RuntimeError):
    pass


@dataclass(frozen=True)
class Settings:
    bot_token: str
    backend_url: str
    backend_webhook_secret: str

    @classmethod
    def from_env(cls) -> "Settings":
        bot_token = os.getenv("BOT_TOKEN")
        backend_url = os.getenv("BACKEND_URL")
        backend_webhook_secret = os.getenv("BACKEND_WEBHOOK_SECRET")

        missing = [
            name
            for name, value in (
                ("BOT_TOKEN", bot_token),
                ("BACKEND_URL", backend_url),
                ("BACKEND_WEBHOOK_SECRET", backend_webhook_secret),
            )
            if not value
        ]
        if missing:
            raise MissingConfigError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

        return cls(
            bot_token=bot_token,
            backend_url=backend_url,
            backend_webhook_secret=backend_webhook_secret,
        )
