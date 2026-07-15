import httpx

TIMEOUT = 10.0


class BackendError(RuntimeError):
    pass


async def publish_snapshot(
    backend_url: str, webhook_secret: str, snapshot: dict
) -> dict:
    url = f"{backend_url.rstrip('/')}/internal/metrics"
    headers = {"X-Metrics-Webhook-Secret": webhook_secret}

    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        response = await client.post(url, json=snapshot, headers=headers)

    if response.status_code >= 400:
        raise BackendError(
            f"Backend rejected metrics snapshot ({response.status_code}): {response.text}"
        )
    return response.json()
