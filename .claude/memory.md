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

## Estado del repositorio
- Repo inicializado, remoto `origin` → `github.com/QuanticaSoft/trading`,
  push inicial ya hecho a `main`.
- `.claude/settings.json` deniega `git push *` de forma persistente desde
  el commit "Add project permissions config" — pushes futuros son
  manuales, decisión explícita del usuario.
- Aún no existe código de ninguno de los 4 servicios (bot, backend,
  metrics, terminal) — solo la documentación de arquitectura en `goal.md`.
