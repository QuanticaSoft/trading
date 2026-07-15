# Project Memory

## Decisiones de arquitectura (2026-07-14)
- Metrics service separado en Python (pandas/numpy/ta), no dentro del
  backend NestJS — son stacks distintos, no pueden compartir proceso.
- Bot → Backend: REST HTTP (webhook interno), no cola de mensajes por
  ahora. Reconsiderar Redis/RabbitMQ si el volumen de señales crece.
- v1 no ejecuta trades reales: solo rastrea/muestra señales del canal de
  copytrading. Sin integración de exchange, sin API keys de trading.
- Terminal UI: dashboard web (Next.js/React), no CLI/TUI.
- El cliente del dashboard debe usar `socket.io-client` (NestJS
  WebSocketGateway usa Socket.IO por defecto, no WebSocket nativo).

## Bot de Telegram (2026-07-14)
- Formato de `/signal` diseñado por nosotros (no hay canal real con el que
  contrastar todavía): `SYMBOL=... SIDE=BUY|SELL ENTRY=... SL=... TP=a,b,c`.
  `/trade SIGNAL_ID=<uuid> STATUS=OPENED|CLOSED|CANCELLED PRICE=...`.
  Ajustar `bot/src/schemas.py` y `bot/src/handlers/*.py` si el formato real
  del canal de copytrading resulta distinto — está centralizado ahí.
- Dependencias: aiogram 3.x, pydantic v2, aiohttp (backend client con
  retry/backoff), python-dotenv, pytest+pytest-asyncio. 12 tests pasando.
- `bot/.venv` creado localmente para verificar (gitignored, no se commitea).
- Bot→Backend vía REST con header `X-Bot-Webhook-Secret`; endpoints
  esperados en el backend: `POST /bot/signals`, `POST /bot/trades`,
  `GET /bot/status`. El backend (NestJS) todavía no existe — próximo paso.

## Backend NestJS (2026-07-15)
- Scaffold vía `@nestjs/cli`, NestJS 11. Módulos: `signals` (entidad
  `Signal` + `SignalsService`), `events` (`EventsGateway` WebSocket
  Socket.IO), `bot` (`BotController` con `BotWebhookGuard`).
- `synchronize: true` en TypeORM solo para dev (`NODE_ENV !== 'production'`)
  — falta migrar a migraciones reales antes de producción, queda como TODO
  en `app.module.ts`.
- Verificado end-to-end con un Postgres real en Docker (efímero, ya
  eliminado): arranque, guard de auth (401 sin secret), creación de señal,
  actualización de trade, consulta de status y resumen — los 4 endpoints
  funcionan correctamente. 8 tests unitarios + typecheck + eslint limpios.
- `bot-webhook.guard.ts` es la única barrera antes de `/bot/*`: si
  `BOT_WEBHOOK_SECRET` no está seteado, rechaza todo (falla cerrado).

## Metrics Service (2026-07-15)
- FastAPI, lee `signals` directo de Postgres (SQLAlchemy, solo lectura).
  `compute_summary()` en `src/metrics.py` es pura (recibe un DataFrame),
  testeada con 12 casos sintéticos sin DB. `ta`/indicadores técnicos
  quedaron fuera de v1: no hay ingesta de precios OHLC todavía — decisión
  documentada en `goal.md`, no inventé esa funcionalidad sin datos reales.
- **Bug encontrado y corregido:** el `.gitignore` raíz tenía `.env.*` sin
  excepción, lo que silenciosamente excluía TODOS los `.env.example`
  (incluyendo el del bot, que nunca se había comiteado desde el principio).
  Agregado `!.env.example` — revisar si se agregan más servicios que
  cualquier `.env.example` nuevo sí quede trackeado.
- Verificado end-to-end con Postgres+backend reales (contenedores
  efímeros, eliminados): sembré 4 señales cerradas (pnl +10,-5,+20,-8),
  `/metrics/summary` dio los números correctos a mano (drawdown=8,
  profit_factor=30/13≈2.31), `/metrics/publish` llegó al backend y se
  confirmó la recepción real del evento `metrics.updated` por WebSocket
  con un cliente socket.io de prueba.

## Terminal Web (2026-07-15)
- Next.js 16 + Tailwind v4, `npx create-next-app` (mismo problema de
  `npm install` que NestJS — el CLI falla con EALLOWSCRIPTS, hay que
  correr `npm install` manual después). Estructura: `src/lib` (api.ts,
  socket.ts, types.ts) + `src/components` (StatTile, StatusBadge,
  ConnectionBadge, MetricsPanel, SignalsTable, PnlChart).
- Usé la skill `dataviz` antes de escribir el dashboard: paleta de
  `references/palette.md` (no inventé colores), status siempre con
  punto+texto (nunca solo color), gráfico de línea con hover+crosshair y
  toggle a tabla (accesibilidad), sin dual-axis, sin librería de charts
  externa (SVG a mano, evita una dependencia más).
- Backend: agregué `GET /signals` (público) y `GET /metrics/latest`
  (público, sirve desde un cache en memoria que `POST /internal/metrics`
  actualiza). Decisión explícita del usuario: sin auth en v1, asumiendo
  uso en red privada — ver `goal.md`.
- Corregí un warning real de Next.js: detectaba mal la raíz del
  workspace por un `yarn.lock` de otro proyecto en `Desktop/WorkSpace`;
  fijé `turbopack.root` en `next.config.ts`.
- Verificación real con Playwright headless (Chromium instalado
  temporalmente vía `npx playwright install`, no quedó como dependencia
  del proyecto): datos reales cargando, WebSocket conectado, actualización
  en vivo sin recargar, toggle gráfico/tabla, capturas en claro y oscuro
  revisadas. Postgres+backend+metrics-service efímeros, todo eliminado
  después.

## Estado del repositorio
- Repo inicializado, remoto `origin` → `github.com/QuanticaSoft/trading`,
  push inicial ya hecho a `main`.
- `.claude/settings.json` deniega `git push *` de forma persistente desde
  el commit "Add project permissions config" — pushes futuros son
  manuales, decisión explícita del usuario.
- Aún no existe código de ninguno de los 4 servicios (bot, backend,
  metrics, terminal) — solo la documentación de arquitectura en `goal.md`.
