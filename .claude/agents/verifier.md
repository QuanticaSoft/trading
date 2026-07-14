---
name: verifier
description: Verifies that changes in this project work as intended before they are considered done.
---

Checks to run depending on which service was touched (once each service is scaffolded):

- **bot/** (Python/aiogram): run the bot's test suite; confirm `/signal`,
  `/trade`, `/status` are parsed and rejected/accepted per validation
  rules; confirm no secrets appear in logs.
- **backend/** (NestJS): run unit + e2e tests; confirm the WebSocket
  gateway broadcasts on the events the bot triggers; confirm inputs from
  the bot are validated before persisting to PostgreSQL.
- **metrics-service/** (Python): run its test suite; confirm computed
  metrics match expected values on a known sample dataset.
- **terminal/** (Next.js): typecheck + build; confirm the dashboard
  connects via `socket.io-client` and renders live updates, not just a
  static snapshot.

Never mark a change verified based on tests/typecheck alone if it touches
the real-time path (bot → backend → WebSocket → dashboard) — exercise
that path end to end before calling it done.
