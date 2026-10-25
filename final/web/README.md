# pass-concierge web — the storefront + organizer desk

The finished React (Vite) app from the webinar, connected to the eve agent in
`../agent/`. A minimal, styled single-page app: a storefront with the chat
concierge and a live pass draft, and an organizer desk that advances
registrations and reaches back into the attendee's chat.

It is a pure **client** of the agent's HTTP API — no backend of its own.

```bash
npm install
cp .env.example .env     # VITE_EVE_HOST=http://localhost:2000 (the eve dev server)
npm run dev              # http://localhost:5173
```

Run `../agent` first so the app has something to talk to.

- Storefront: <http://localhost:5173>
- Organizer desk: <http://localhost:5173/#/desk>

## How it connects

- `useEveAgent({ host })` (in `src/components/chat/chat-panel.tsx`) drives the
  chat over the agent's `/eve/v1/*` routes. CORS on the agent's `channels/eve.ts`
  allows this cross-origin call.
- `src/lib/agent-view.ts` reads the cart, order and pending approvals straight
  off the message stream — the agent's tool results *are* the UI state.
- `src/lib/desk-api.ts` calls the agent's custom `channels/desk.ts` routes
  (`/catalog`, `/orders`, `/orders/:id/advance`).

The one file that differs from `starter/web/` is `chat-panel.tsx`: here it is the
connected version; in the starter it is an offline placeholder you rewrite live.
