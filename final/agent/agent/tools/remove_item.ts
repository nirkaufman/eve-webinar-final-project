import { defineTool } from "eve/tools";
import { z } from "zod";

import { removeLine, snapshotCart } from "../lib/cart";

export default defineTool({
  description: "Remove one line from the draft by its line id, then return the updated draft.",
  inputSchema: z.object({
    lineId: z.string().describe("The id of the draft line to remove, e.g. 'line-2'."),
  }),
  async execute({ lineId }) {
    const removed = removeLine(lineId);
    if (!removed) {
      throw new Error(`No draft line "${lineId}". Call view your draft to see what is actually in it.`);
    }

    return { removed: lineId, cart: snapshotCart() };
  },
});
