import { defineTool } from "eve/tools";
import { z } from "zod";

import { describePass, getCatalog, resolveAddons, resolveFormat, resolveTier } from "../../lib/catalog";
import { formatPrice, pricePass } from "../../lib/pricing";
import { addLine, snapshotCart } from "../lib/cart";

export default defineTool({
  description:
    "Price a conference pass and add it to the attendee's draft. Use a bundle id to start from one of ours, or pass tier, format and add-ons to build a custom one. Returns the priced line and the whole draft.",
  inputSchema: z.object({
    bundleId: z
      .string()
      .optional()
      .describe("Start from a bundle. Its tier, format and add-ons are used unless you override them."),
    tierId: z.string().optional().describe("Tier id from get_catalog, e.g. 'standard'. Defaults to standard."),
    formatId: z.string().optional().describe("Format id from get_catalog, e.g. 'online'. Defaults to online."),
    addonIds: z
      .array(z.string())
      .optional()
      .describe("The complete list of add-on ids on this pass."),
    quantity: z.number().int().min(1).max(20).default(1).describe("How many identical passes to register."),
  }),
  async execute(input) {
    const catalog = getCatalog();

    const bundle = input.bundleId
      ? catalog.bundles.find((candidate) => candidate.id === input.bundleId)
      : undefined;

    if (input.bundleId && !bundle) {
      throw new Error(
        `Unknown bundle "${input.bundleId}". Available: ${catalog.bundles.map((b) => b.id).join(", ")}.`,
      );
    }

    const tier = resolveTier(catalog, input.tierId ?? bundle?.tierId ?? "standard");
    const format = resolveFormat(catalog, input.formatId ?? bundle?.formatId ?? "online");
    const addons = resolveAddons(catalog, input.addonIds ?? bundle?.addonIds ?? []);

    const unitPriceCents = pricePass({ tier, format, addons, quantity: input.quantity });
    const name = bundle && !input.addonIds ? `${bundle.name} (${tier.name})` : describePass(tier, format, addons);

    const line = addLine({
      name,
      tierId: tier.id,
      formatId: format.id,
      addonIds: addons.map((addon) => addon.id),
      quantity: input.quantity,
      unitPriceCents,
    });

    return {
      added: { ...line, unitPrice: formatPrice(unitPriceCents) },
      cart: snapshotCart(),
    };
  },
});
