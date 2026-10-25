import type { Addon, Format, Tier } from "./db/schema";

/**
 * The single source of truth for what a pass costs. Both the agent's tools and
 * the storefront call this, so a price quoted in chat can never drift from the
 * price on the receipt. A pass is a tier base, plus a format surcharge, plus
 * every add-on.
 */
export function pricePass(input: {
  tier: Tier;
  format: Format;
  addons: Addon[];
  quantity: number;
}): number {
  const addonsCents = input.addons.reduce((sum, addon) => sum + addon.priceCents, 0);
  return input.tier.basePriceCents + input.format.surchargeCents + addonsCents;
}

export function subtotalCents(lines: readonly { unitPriceCents: number; quantity: number }[]): number {
  return lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
