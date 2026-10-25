# Pass Concierge — Zero to Production Agent

A complete, production-ready AI registration agent built live during the
"Zero to Production Agent" webinar. It lets attendees browse passes, build a
custom order, and register — all through a chat interface — while the
organizer team manages registrations from a separate desk view.

---

## Prerequisites

- **Node.js 24.x** (the agent's native SQLite bindings require it)
- An **Anthropic API key** — get one at [console.anthropic.com](https://console.anthropic.com)

---

## Setup

### 1. Clone and install

```bash
# from the repo root
cd final/agent && npm install
cd ../web && npm install
```

### 2. Configure the agent

```bash
cd final/agent
cp .env.example .env
```

Open `.env` and paste your key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### 3. Seed the database

```bash
cd final/agent
npm run setup
```

This creates `pass.db`, runs the schema migrations, and seeds the catalog
(tiers, formats, add-ons, and preset bundles).

### 4. Configure the web app

```bash
cd final/web
cp .env.example .env
```

The default points at `http://localhost:2000`, which is where the eve dev
server listens. Change it only if you moved the agent port.

---

## Running locally

Open two terminals:

```bash
# Terminal 1 — agent
cd final/agent
npm run dev
```

```bash
# Terminal 2 — web
cd final/web
npm run dev
```

The web app opens at `http://localhost:5173`.

- **Storefront** (default) — the attendee-facing chat and pass builder
- **Organizer desk** — navigate to `/#/desk` to see and advance registrations

---

## Project structure

```
final/
├── agent/                   Eve agent (backend)
│   ├── agent/
│   │   ├── agent.ts         Agent definition (model, build config)
│   │   ├── instructions.md  System prompt
│   │   ├── sandbox.ts       Sandbox environment (JustBash — no container)
│   │   ├── tools/           Agent tools (add_item, register, get_catalog, …)
│   │   ├── channels/        HTTP channels (desk API, eve default channel)
│   │   └── lib/             Agent-internal helpers (cart state)
│   ├── lib/                 Domain logic (catalog, orders, pricing, db)
│   │   └── db/              Drizzle schema + seed data
│   ├── evals/               Automated behavioral evaluations
│   └── drizzle.config.ts    Database config
│
└── web/                     React frontend (Vite)
    └── src/
        ├── App.tsx           Hash router (storefront vs desk)
        └── components/       Storefront, DeskPage, and UI pieces
```

---

## Architecture

```
  Browser (React + Vite)
       │
       │  chat turns  →  Eve HTTP API  (localhost:2000)
       │  REST reads  →  /catalog, /orders
       │  REST writes →  /orders/:id/advance
       │
  Eve Agent process
       ├── Claude claude-sonnet-5-5
       ├── Tools          (add_item, remove_item, register, get_catalog,
       │                   get_registration_status)
       ├── Desk channel   (CORS-enabled REST surface for the web app)
       └── SQLite (pass.db via Drizzle ORM)
            ├── catalog tables  (tiers, formats, addons, bundles)
            └── order tables    (orders, order_items)
```

The agent and the organizer desk share the same process and the same
database. When the desk advances a registration, the agent re-enters the
attendee's original chat session and delivers the update — even if they
closed the tab.

---

## Features

### Storefront (attendee view)

- **Conversational pass builder** — the agent walks attendees through tiers,
  formats, and add-ons; the live cart updates as items are added or removed.
- **Catalog-grounded answers** — the agent calls `get_catalog` before
  discussing anything; it cannot invent tiers, formats, or prices.
- **Human-approved registration** — the `register` tool requires explicit
  attendee confirmation before it writes to the database.
- **Persistent sessions** — chat history survives tab closes; desk updates
  arrive in the original session whenever the organizer advances a registration.

### Organizer desk (`/#/desk`)

- **Registration list** — all orders with status, attendee name, pass
  summary, and total.
- **One-click status advance** — moves a registration through four stages:
  `received → seat_confirmed → materials_sent → welcome_booked`.
- **In-chat notifications** — each advance injects a desk message into the
  attendee's session; the agent relays it in plain language.

### Evals

Four behavioral evaluations (run with `npm run eval` in `final/agent`):

| Eval | What it checks |
|---|---|
| `catalog-is-truth` | Agent calls `get_catalog` before quoting prices |
| `pass-is-priced` | Agent uses `add_item` for pricing, never invents a number |
| `registration-needs-approval` | `register` triggers an approval prompt |
| `recommendation-loads-skill` | Agent asks clarifying questions before recommending |

---

## Database reset

To start fresh (wipes all orders and re-seeds the catalog):

```bash
cd final/agent
npm run db:reset
```
