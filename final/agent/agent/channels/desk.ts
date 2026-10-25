import { defineChannel, GET, POST } from "eve/channels";

import { getCatalog } from "../../lib/catalog";
import { DESK_PREFIX, DESK_UPDATES } from "../../lib/registration-flow";
import { advanceOrder, getOrder, listOrders } from "../../lib/orders";

/**
 * A second HTTP surface on the same agent, for the web app's two reads and one
 * write that aren't a chat turn:
 *
 *   GET  /catalog               the storefront board
 *   GET  /orders                the organizer desk list
 *   POST /orders/:id/advance    move a registration one stage on
 *
 * Route paths are app URLs — the channel filename does not prefix them. We never
 * leave the agent process: the advance route reads and writes the same database
 * the tools use, and reaches back into the attendee's chat with `attachSession`.
 *
 * `cors: true` lets the browser app (a different origin) call these routes.
 */
export default defineChannel({
  cors: true,
  routes: [
    GET("/catalog", async () => Response.json(getCatalog())),

    GET("/orders", async () => Response.json(listOrders())),

    GET("/orders/:id", async (_request, { params }) => {
      const order = getOrder(Number(params.id));
      return order ? Response.json(order) : Response.json({ error: "No such registration." }, { status: 404 });
    }),

    POST("/orders/:id/advance", async (_request, { attachSession, params }) => {
      const order = advanceOrder(Number(params.id));

      if (!order) {
        const exists = getOrder(Number(params.id)) !== null;
        return Response.json(
          { error: exists ? "That registration is already at its last stage." : "No such registration." },
          { status: exists ? 409 : 404 },
        );
      }

      // Tell the attendee, in the chat they registered from. This starts a turn
      // on their durable session, and the agent's reply lands in their
      // transcript — even if they closed the tab an hour ago.
      let notified = false;
      if (order.sessionId) {
        try {
          await attachSession(order.sessionId).send(
            `${DESK_PREFIX} Registration #${order.id}: ${DESK_UPDATES[order.status]} Pass this on to the attendee in one line.`,
            { auth: null },
          );
          notified = true;
        } catch (error) {
          console.warn(`[desk] could not reach session ${order.sessionId}:`, error);
        }
      }

      return Response.json({ ...order, notified });
    }),
  ],
});
