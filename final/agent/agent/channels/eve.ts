import { localDev, none, vercelOidc } from "eve/channels/auth";
import { eveChannel } from "eve/channels/eve";

/**
 * The HTTP surface every client talks to: the eve REPL, `eve eval`, and — once
 * we bring up the web app — the browser chat.
 *
 * `none()` makes this a public demo: anyone who can reach it can start a
 * session. Swap it for your app's session check before real attendees.
 *
 * `cors: true` lets the browser app, served from a different origin (the Vite
 * dev server), call these routes. Without it the browser's preflight fails.
 */
export default eveChannel({
  auth: [vercelOidc(), localDev(), none()],
  cors: true,
});
