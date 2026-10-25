import { EVE_HOST } from "./config";
import type { OrderStatus } from "./registration-flow";

/** The catalog shape returned by `GET /catalog` (raw cents; the UI formats). */
export interface Catalog {
  readonly tiers: readonly { id: string; name: string; blurb: string; basePriceCents: number }[];
  readonly formats: readonly { id: string; name: string; description: string; surchargeCents: number }[];
  readonly addons: readonly {
    id: string;
    name: string;
    category: "workshop" | "mentoring" | "social" | "extras";
    priceCents: number;
    highlight: boolean;
  }[];
  readonly bundles: readonly {
    id: string;
    name: string;
    description: string;
    tierId: string;
    formatId: string;
    addonIds: string[];
    badge: string | null;
  }[];
}

export interface DeskOrder {
  readonly id: number;
  readonly sessionId: string | null;
  readonly attendeeName: string;
  readonly email: string;
  readonly company: string | null;
  readonly notes: string | null;
  readonly status: OrderStatus;
  readonly totalCents: number;
  readonly placedAt: number;
  readonly items: readonly { id: number; name: string; quantity: number }[];
}

export async function fetchCatalog(): Promise<Catalog> {
  const response = await fetch(`${EVE_HOST}/catalog`);
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  return (await response.json()) as Catalog;
}

export async function fetchOrders(): Promise<DeskOrder[]> {
  const response = await fetch(`${EVE_HOST}/orders`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Orders request failed: ${response.status}`);
  return (await response.json()) as DeskOrder[];
}

export async function fetchOrder(id: number): Promise<DeskOrder | null> {
  const response = await fetch(`${EVE_HOST}/orders/${id}`, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as DeskOrder;
}

export async function advanceOrder(id: number): Promise<void> {
  await fetch(`${EVE_HOST}/orders/${id}/advance`, { method: "POST" });
}
