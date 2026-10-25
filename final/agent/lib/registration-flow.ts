/**
 * Registration vocabulary with no database import, so client components can use
 * it too. `lib/orders.ts` owns the queries; this file owns the shared meaning.
 */
export type OrderStatus = "received" | "seat_confirmed" | "materials_sent" | "welcome_booked";

export const ORDER_FLOW: readonly OrderStatus[] = [
  "received",
  "seat_confirmed",
  "materials_sent",
  "welcome_booked",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Registration received",
  seat_confirmed: "Seat confirmed",
  materials_sent: "Materials sent",
  welcome_booked: "Welcome call booked",
};

/** Marks a message the organizer desk injected into a session, not something the attendee typed. */
export const DESK_PREFIX = "[desk]";

/** What the desk says when a registration reaches each stage. */
export const DESK_UPDATES: Record<OrderStatus, string> = {
  received: "We've got your registration.",
  seat_confirmed: "Your seat is confirmed — see you there!",
  materials_sent: "Your workshop materials are on their way.",
  welcome_booked: "Your welcome call is booked. Check your inbox for the invite.",
};

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status);
  return index >= 0 && index < ORDER_FLOW.length - 1 ? ORDER_FLOW[index + 1] : null;
}
