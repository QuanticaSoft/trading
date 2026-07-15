import asyncio
import logging
from typing import Any

import aiohttp

logger = logging.getLogger("bot.backend_client")

MAX_ATTEMPTS = 3
BASE_BACKOFF_SECONDS = 1.0
REQUEST_TIMEOUT = aiohttp.ClientTimeout(total=10)


class BackendError(RuntimeError):
    pass


class BackendClient:
    """Talks to the NestJS backend's internal webhook endpoints.

    Retries transient failures (network errors, 5xx) with exponential
    backoff. 4xx responses are not retried — they mean the payload was
    rejected and retrying would just repeat the same error.
    """

    def __init__(self, base_url: str, webhook_secret: str) -> None:
        self._base_url = base_url.rstrip("/")
        self._headers = {"X-Bot-Webhook-Secret": webhook_secret}

    async def post_signal(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/bot/signals", payload)

    async def post_trade(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._post("/bot/trades", payload)

    async def get_status(self, signal_id: str | None) -> dict[str, Any]:
        params = {"signal_id": signal_id} if signal_id else None
        return await self._get("/bot/status", params)

    async def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._request("POST", path, json=payload)

    async def _get(
        self, path: str, params: dict[str, str] | None
    ) -> dict[str, Any]:
        return await self._request("GET", path, params=params)

    async def _request(self, method: str, path: str, **kwargs: Any) -> dict[str, Any]:
        url = f"{self._base_url}{path}"
        last_error: Exception | None = None

        for attempt in range(1, MAX_ATTEMPTS + 1):
            try:
                async with aiohttp.ClientSession(
                    headers=self._headers, timeout=REQUEST_TIMEOUT
                ) as session, session.request(method, url, **kwargs) as response:
                    if response.status >= 500:
                        raise BackendError(f"Backend {response.status} on {path}")
                    if response.status >= 400:
                        body = await response.text()
                        raise BackendError(
                            f"Backend rejected {path} ({response.status}): {body}"
                        )
                    return await response.json()
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                last_error = exc
            except BackendError as exc:
                if "rejected" in str(exc):
                    raise
                last_error = exc

            if attempt < MAX_ATTEMPTS:
                delay = BASE_BACKOFF_SECONDS * (2 ** (attempt - 1))
                logger.warning(
                    "Backend call failed (attempt %s/%s), retrying in %.1fs: %s",
                    attempt,
                    MAX_ATTEMPTS,
                    delay,
                    last_error,
                )
                await asyncio.sleep(delay)

        raise BackendError(f"Backend call to {path} failed after {MAX_ATTEMPTS} attempts") from last_error
