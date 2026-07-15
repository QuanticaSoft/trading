# Goal

Terminal de monitorización conectada a un bot de copytrading en Telegram: un
dashboard en tiempo real que muestra señales, ejecuciones, métricas de
rendimiento y alertas.

## Scope
- v1 solo **rastrea y muestra** señales/operaciones reportadas por el canal
  de copytrading. No ejecuta trades reales en ningún exchange/broker.

## Non-goals (v1)
- Ejecución automática de órdenes en un exchange/broker.
- Custodia de fondos o claves con permiso de Withdraw.

## Arquitectura

```
Telegram ──> Bot (Python)  ──REST──>  Backend (NestJS)  <──lee/escribe── PostgreSQL
                                          │        ▲
                                          │        │ REST/cola de resultados
                                     WebSocket   Metrics Service (Python)
                                          │
                                          ▼
                                 Terminal Web (Next.js/React)
```

1. **Telegram Bot** — Python 3.10+, `aiogram` 3.x (async, rate-limiting
   nativo vía `@flags.rate_limit`, control de concurrencia con semáforos).
   Recibe comandos estructurados `/signal`, `/trade`, `/status`, valida el
   formato y reenvía el evento al Backend.
2. **Backend API** — NestJS. Expone:
   - Endpoints REST internos que el Bot llama para reportar eventos
     (webhook interno, no público).
   - Un `WebSocketGateway` (Socket.IO) que retransmite en tiempo real a la
     Terminal Web. Importante: el cliente del dashboard debe usar
     `socket.io-client`, no el `WebSocket` nativo del navegador — NestJS
     usa el adaptador Socket.IO por defecto y los protocolos no son
     compatibles entre sí.
   - Persiste todo en PostgreSQL. Valida tipos/rangos de cualquier dato
     que venga del Bot antes de guardar.
3. **Metrics Service** — microservicio Python separado (`pandas`, `numpy`,
   `ta`). Lee de PostgreSQL, calcula métricas de rendimiento (PnL, win
   rate, drawdown, indicadores técnicos) y expone los resultados al
   Backend (REST). El Backend los persiste/cachea y los retransmite por
   WebSocket. Vive aparte del Backend porque son stacks distintos
   (Python vs Node) — no hay forma de correr pandas dentro de NestJS.
4. **Terminal Web** — Next.js/React. Consume el WebSocket del Backend y
   muestra señales, ejecuciones, métricas y alertas en tiempo real.

## Stack tecnológico (decidido)
| Componente | Tecnología |
|---|---|
| Telegram Bot | Python 3.10+, aiogram 3.x |
| Backend API | NestJS + WebSockets (Socket.IO) |
| Base de datos | PostgreSQL |
| Metrics Service | Python, pandas, numpy, ta |
| Terminal UI | Next.js / React |
| Comunicación Bot → Backend | REST HTTP (webhook interno) |

## Contrato REST Bot → Backend (implementado)
Todos los endpoints bajo `/bot/*` requieren el header `x-bot-webhook-secret`
(debe coincidir con `BOT_WEBHOOK_SECRET`), verificado por `BotWebhookGuard`.

- `POST /bot/signals` — body: `signal_id, symbol, side, entry, stop_loss?,
  take_profit?, source?`. Crea el `Signal` en estado `PENDING` y emite
  `signal.created` por WebSocket.
- `POST /bot/trades` — body: `signal_id, status (OPENED|CLOSED|CANCELLED),
  price?, pnl?`. Actualiza el `Signal` existente y emite `signal.updated`.
  Responde 404 si `signal_id` no existe.
- `GET /bot/status?signal_id=<uuid>` — devuelve ese signal, o sin
  `signal_id` devuelve el resumen de conteos por estado.
- `GET /health` — sin auth, healthcheck simple.

## Metrics Service (implementado)
Microservicio FastAPI independiente (`metrics-service/`), solo lectura
sobre PostgreSQL:

- `GET /health` — healthcheck.
- `GET /metrics/summary` — calcula al vuelo desde `signals` (status=CLOSED,
  pnl no nulo): `closed_trades`, `win_rate`, `total_pnl`, `average_pnl`,
  `max_drawdown` (pico a valle sobre el pnl acumulado), `profit_factor`
  (ganancia bruta / pérdida bruta).
- `POST /metrics/publish` — calcula y hace `POST` a
  `{BACKEND_URL}/internal/metrics` con header `X-Metrics-Webhook-Secret`.
  El backend valida, retransmite por WebSocket (`metrics.updated`) y NO
  persiste el snapshot (es recalculable en cualquier momento desde
  `signals`, no hace falta guardarlo).
- **Limitación conocida:** `ta` (indicadores técnicos) todavía no se usa
  — requiere una serie de precios OHLC que este proyecto no ingesta hoy.
  Si se agrega una fuente de velas/precios, ahí se integra `ta`.
- Nada dispara `/metrics/publish` automáticamente todavía (sin scheduler);
  se llama a mano o desde donde se decida más adelante.

## Seguridad y cumplimiento (crítico)
- **Telegram ToS:** no manipular mensajes de otros usuarios sin
  consentimiento. Usar solo `/signal` estructurado.
- **API Keys de exchange:** no aplica en v1 (no hay ejecución de trades).
  Si en el futuro se habilita ejecución, usar keys con permiso **Trade
  únicamente**, nunca **Withdraw**.
- **Rate limits de Telegram:** ~30 msg/s. Usar colas (`asyncio.Queue`) y
  reintentos con backoff; `aiogram` ya aporta throttling nativo.
- **Validación:** nunca confiar en datos externos. Validar tipos, rangos y
  firmas si se usan mensajes firmados, tanto en el Bot como en el Backend.
- **Logs:** registrar solo IDs técnicos. Nunca guardar claves privadas,
  frases semilla ni datos sensibles.
- **Secretos:** tokens del bot, credenciales de DB y (si aplica en el
  futuro) API keys de exchange van en variables de entorno, nunca en el
  repo. Ver `.gitignore`.
