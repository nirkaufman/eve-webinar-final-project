import { asc } from "drizzle-orm";

import { addons, bundles, db, formats, tiers } from "./db";
import type { Addon, Bundle, Format, Tier } from "./db/schema";
import { pricePass } from "./pricing";

export interface Catalog {
  readonly tiers: Tier[];
  readonly formats: Format[];
  readonly addons: Addon[];
  readonly bundles: Bundle[];
}

export function getCatalog(): Catalog {
  return {
    tiers: db.select().from(tiers).orderBy(asc(tiers.sortOrder)).all(),
    formats: db.select().from(formats).orderBy(asc(formats.sortOrder)).all(),
    addons: db.select().from(addons).orderBy(asc(addons.name)).all(),
    bundles: db.select().from(bundles).orderBy(asc(bundles.name)).all(),
  };
}

/**
 * Catalog lookups are deliberately strict: an unknown id is an error the model
 * has to see and correct, not a silently dropped add-on.
 */
export function resolveTier(catalog: Catalog, tierId: string): Tier {
  const tier = catalog.tiers.find((candidate) => candidate.id === tierId);
  if (!tier) {
    throw new Error(`Unknown tier "${tierId}". Available tiers: ${catalog.tiers.map((t) => t.id).join(", ")}.`);
  }
  return tier;
}

export function resolveFormat(catalog: Catalog, formatId: string): Format {
  const format = catalog.formats.find((candidate) => candidate.id === formatId);
  if (!format) {
    throw new Error(`Unknown format "${formatId}". Available formats: ${catalog.formats.map((f) => f.id).join(", ")}.`);
  }
  return format;
}

export function resolveAddons(catalog: Catalog, addonIds: readonly string[]): Addon[] {
  return addonIds.map((addonId) => {
    const addon = catalog.addons.find((candidate) => candidate.id === addonId);
    if (!addon) {
      throw new Error(
        `Unknown add-on "${addonId}". Call get_catalog to see the ${catalog.addons.length} add-ons we actually offer.`,
      );
    }
    return addon;
  });
}

export function describePass(tier: Tier, format: Format, addons: readonly Addon[]): string {
  const names = addons.map((addon) => addon.name);
  const withAddons = names.length > 0 ? ` + ${names.join(", ")}` : "";
  return `${tier.name} · ${format.name}${withAddons}`;
}

/** What a bundle costs, through the same pricing function a registration uses. */
export function priceBundle(catalog: Catalog, bundle: Bundle): number {
  return pricePass({
    tier: resolveTier(catalog, bundle.tierId),
    format: resolveFormat(catalog, bundle.formatId),
    addons: resolveAddons(catalog, bundle.addonIds),
    quantity: 1,
  });
}
