import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { createOrder } from "../../lib/orders";
import { formatPrice } from "../../lib/pricing";
import { clearCart, snapshotCart } from "../lib/cart";

export default defineTool({
  description:
    "Register the draft as a real registration for the summit. The attendee has to approve this before it runs, so read the pass and the total back to them first.",
  inputSchema: z.object({
    attendeeName: z.string().min(1).describe("Who the registration is for."),
    email: z.string().min(1).describe("Email for the confirmation and the welcome call invite."),
    company: z.string().optional().describe("Company or team, if the attendee mentioned one."),
    notes: z.string().optional().describe("Anything the organizers need to know (access needs, dietary, etc.)."),
  }),

  // The one irreversible action in the app: a person signs off before it runs.
  approval: always(),

  async execute(input, ctx) {
    const snapshot = snapshotCart();
    if (snapshot.isEmpty) {
      throw new Error("The draft is empty. Add a pass before registering.");
    }

    const order = createOrder({
      sessionId: ctx.session.id,
      attendeeName: input.attendeeName,
      email: input.email,
      company: input.company,
      notes: input.notes,
      subtotalCents: snapshot.subtotalCents,
      items: snapshot.lines.map((line) => ({
        name: line.name,
        tierId: line.tierId,
        formatId: line.formatId,
        addonIds: line.addonIds,
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
      })),
    });

    // The draft has become a row. It should not outlive the registration.
    clearCart();

    return {
      order: {
        id: order.id,
        status: order.status,
        attendeeName: order.attendeeName,
        email: order.email,
        total: formatPrice(order.totalCents),
        items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
      },
    };
  },
});
