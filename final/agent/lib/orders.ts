import { desc, eq } from "drizzle-orm";

import { db, orderItems, orders } from "./db";
import type { Order, OrderItem } from "./db/schema";
import { nextStatus } from "./registration-flow";

export { ORDER_FLOW, ORDER_STATUS_LABELS, DESK_UPDATES, DESK_PREFIX, nextStatus } from "./registration-flow";
export type { OrderStatus } from "./registration-flow";

export interface OrderWithItems extends Order {
  readonly items: OrderItem[];
}

export interface NewOrderInput {
  readonly sessionId: string | null;
  readonly attendeeName: string;
  readonly email: string;
  readonly company?: string;
  readonly notes?: string;
  readonly subtotalCents: number;
  readonly items: readonly {
    name: string;
    tierId: string;
    formatId: string;
    addonIds: string[];
    unitPriceCents: number;
    quantity: number;
  }[];
}

export function createOrder(input: NewOrderInput): OrderWithItems {
  const now = new Date();

  return db.transaction((tx) => {
    const [order] = tx
      .insert(orders)
      .values({
        sessionId: input.sessionId,
        attendeeName: input.attendeeName,
        email: input.email,
        company: input.company,
        notes: input.notes,
        status: "received",
        subtotalCents: input.subtotalCents,
        totalCents: input.subtotalCents,
        placedAt: now,
        updatedAt: now,
      })
      .returning()
      .all();

    const items = tx
      .insert(orderItems)
      .values(input.items.map((item) => ({ ...item, orderId: order.id })))
      .returning()
      .all();

    return { ...order, items };
  });
}

export function getOrder(orderId: number): OrderWithItems | null {
  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return null;

  const items = db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
  return { ...order, items };
}

export function listOrders(limit = 20): OrderWithItems[] {
  const rows = db.select().from(orders).orderBy(desc(orders.placedAt)).limit(limit).all();
  return rows.map((order) => ({
    ...order,
    items: db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).all(),
  }));
}

/** Moves a registration one stage forward. Returns null when it is already at the last stage. */
export function advanceOrder(orderId: number): OrderWithItems | null {
  const order = getOrder(orderId);
  if (!order) return null;

  const next = nextStatus(order.status);
  if (!next) return null;

  db.update(orders).set({ status: next, updatedAt: new Date() }).where(eq(orders.id, orderId)).run();
  return getOrder(orderId);
}
