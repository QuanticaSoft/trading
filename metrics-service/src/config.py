import os
from dataclasses import dataclass


class MissingConfigError(RuntimeError):
    pass


@dataclass(frozen=True)
class Settings:
    db_host: str
    db_port: int
    db_username: str
    db_password: str
    db_name: str
    backend_url: str
    metrics_webhook_secret: str

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://{self.db_username}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @classmethod
    def from_env(cls) -> "Settings":
        backend_url = os.getenv("BACKEND_URL")
        metrics_webhook_secret = os.getenv("METRICS_WEBHOOK_SECRET")

        missing = [
            name
            for name, value in (
                ("BACKEND_URL", backend_url),
                ("METRICS_WEBHOOK_SECRET", metrics_webhook_secret),
            )
            if not value
        ]
        if missing:
            raise MissingConfigError(
                f"Missing required environment variables: {', '.join(missing)}"
            )

        return cls(
            db_host=os.getenv("DB_HOST", "localhost"),
            db_port=int(os.getenv("DB_PORT", "5432")),
            db_username=os.getenv("DB_USERNAME", "postgres"),
            db_password=os.getenv("DB_PASSWORD", "postgres"),
            db_name=os.getenv("DB_NAME", "trading"),
            backend_url=backend_url,
            metrics_webhook_secret=metrics_webhook_secret,
        )
