import { defineTool } from "eve/tools";
import { z } from "zod";

import { getCatalog } from "../../lib/catalog";
import { formatPrice } from "../../lib/pricing";

export default defineTool({
  description:
    "Read the AI Poland pass catalog: tiers, formats, add-ons and ready-made bundles, with current prices. Call this before describing or pricing anything.",
  inputSchema: z.object({}),
  async execute() {
    const catalog = getCatalog();

    return {
      tiers: catalog.tiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        blurb: tier.blurb,
        basePrice: formatPrice(tier.basePriceCents),
      })),
      formats: catalog.formats.map((format) => ({
        id: format.id,
        name: format.name,
        description: format.description,
        surcharge: formatPrice(format.surchargeCents),
      })),
      addons: catalog.addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        category: addon.category,
        price: formatPrice(addon.priceCents),
      })),
      bundles: catalog.bundles.map((bundle) => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description,
        tierId: bundle.tierId,
        formatId: bundle.formatId,
        addonIds: bundle.addonIds,
      })),
      note: "A pass costs its tier base price, plus the format surcharge, plus every add-on. A bundle is just a preset tier, format and add-ons.",
    };
  },
});
