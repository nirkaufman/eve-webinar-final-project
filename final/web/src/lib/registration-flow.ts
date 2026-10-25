/** Client copy of the registration vocabulary (the agent owns the server copy). */
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

/** Messages the organizer desk injects into a session start with this. */
export const DESK_PREFIX = "[desk]";

export function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = ORDER_FLOW.indexOf(status);
  return index >= 0 && index < ORDER_FLOW.length - 1 ? ORDER_FLOW[index + 1] : null;
}
