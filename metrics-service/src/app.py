import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException

from .backend_client import BackendError, publish_snapshot
from .config import Settings
from .db import fetch_closed_signals, make_engine
from .metrics import build_snapshot

logger = logging.getLogger("metrics_service")

load_dotenv()
settings = Settings.from_env()
engine = make_engine(settings.database_url)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    engine.dispose()


app = FastAPI(title="Trading Metrics Service", lifespan=lifespan)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/metrics/summary")
def metrics_summary() -> dict:
    closed_signals = fetch_closed_signals(engine)
    return build_snapshot(closed_signals)


@app.post("/metrics/publish")
async def metrics_publish() -> dict:
    closed_signals = fetch_closed_signals(engine)
    snapshot = build_snapshot(closed_signals)
    try:
        backend_response = await publish_snapshot(
            settings.backend_url, settings.metrics_webhook_secret, snapshot
        )
    except BackendError as exc:
        logger.exception("Failed to publish metrics snapshot to backend")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"snapshot": snapshot, "backend_response": backend_response}
