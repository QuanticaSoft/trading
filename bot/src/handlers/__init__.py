from aiogram import Router

from ..services.backend_client import BackendClient
from .signal import build_signal_router
from .status import build_status_router
from .trade import build_trade_router


def build_root_router(backend: BackendClient) -> Router:
    root = Router(name="root")
    root.include_router(build_signal_router(backend))
    root.include_router(build_trade_router(backend))
    root.include_router(build_status_router(backend))
    return root
