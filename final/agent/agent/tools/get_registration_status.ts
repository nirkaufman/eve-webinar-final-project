import { defineTool } from "eve/tools";
import { z } from "zod";

import { ORDER_STATUS_LABELS, getOrder } from "../../lib/orders";
import { formatPrice } from "../../lib/pricing";

export default defineTool({
  description: "Look up where a registration is: its stage with the organizers and what has happened so far.",
  inputSchema: z.object({
    registrationId: z.number().int().positive().describe("The registration number given to the attendee at sign-up."),
  }),
  async execute({ registrationId }) {
    const order = getOrder(registrationId);
    if (!order) {
      throw new Error(`No registration #${registrationId}.`);
    }

    return {
      id: order.id,
      status: order.status,
      statusLabel: ORDER_STATUS_LABELS[order.status],
      attendeeName: order.attendeeName,
      total: formatPrice(order.totalCents),
      items: order.items.map((item) => ({ name: item.name, quantity: item.quantity })),
    };
  },
});
