# pass-concierge — the eve agent

The finished standalone eve agent from the webinar (`../../code-lab.md`, Act 1 +
Act 2). An AI pass concierge for an AI Poland summit: it reads a SQLite catalog,
prices a pass into durable session state, registers it behind an approval, and
exposes a custom HTTP channel the web app and organizer desk use.

```bash
npm install
cp .env.example .env.local      # paste your ANTHROPIC_API_KEY
npm run setup                   # create + seed pass.db
npm run dev                     # eve REPL + HTTP API on http://127.0.0.1:2000
npm run eval                    # run the four evals (stop the REPL first)
npx eve info                    # 5 tools, 1 skill
```

## The agent

```
agent/
├── agent.ts                      model, defaultTools: false, better-sqlite3 external
├── sandbox.ts                    the lightest (just-bash) sandbox
├── instructions.md               identity, tone, rules
├── channels/eve.ts               the chat HTTP API + CORS + auth (none() demo)
├── channels/desk.ts              custom HTTP: /catalog, /orders, advance + durable push-back
├── lib/cart.ts                   the pass draft, in durable session state
├── skills/recommend-a-pass.md    loaded only when someone needs a recommendation
└── tools/
    ├── get_catalog.ts
    ├── add_item.ts
    ├── remove_item.ts
    ├── register.ts               approval: always()
    └── get_registration_status.ts
evals/                            catalog-is-truth, pass-is-priced,
                                  registration-needs-approval, recommendation-loads-skill
lib/                              non-Eve app code: db (Drizzle/SQLite), pricing, catalog, orders
```

Inside `agent/`, import app code with a **relative** path (`../../lib/catalog`),
not `@/`. `npm run db:reset` gives a clean database.
