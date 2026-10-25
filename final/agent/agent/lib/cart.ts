import { defineState } from "eve/context";

import { formatPrice, subtotalCents } from "../../lib/pricing";

export interface CartLine {
  readonly id: string;
  readonly name: string;
  readonly tierId: string;
  readonly formatId: string;
  readonly addonIds: string[];
  readonly quantity: number;
  readonly unitPriceCents: number;
}

interface CartState {
  readonly lines: CartLine[];
  readonly nextLineNumber: number;
}

/**
 * The in-progress registration lives in durable session state, not in a table.
 * It belongs to the conversation: it survives every turn, a page reload, and a
 * redeploy, and it disappears the moment the registration becomes a real row.
 */
export const cart = defineState<CartState>("aipoland.cart", () => ({ lines: [], nextLineNumber: 1 }));

export interface CartSnapshot {
  readonly lines: (CartLine & { readonly lineTotal: string })[];
  readonly subtotalCents: number;
  readonly totalCents: number;
  readonly subtotal: string;
  readonly total: string;
  readonly isEmpty: boolean;
}

/**
 * One shape every draft-touching tool returns. The chat UI renders whichever
 * snapshot arrived last, so the draft on screen is always the agent's draft.
 */
export function snapshotCart(): CartSnapshot {
  const { lines } = cart.get();
  const subtotal = subtotalCents(lines);

  return {
    lines: lines.map((line) => ({ ...line, lineTotal: formatPrice(line.unitPriceCents * line.quantity) })),
    subtotalCents: subtotal,
    totalCents: subtotal,
    subtotal: formatPrice(subtotal),
    total: formatPrice(subtotal),
    isEmpty: lines.length === 0,
  };
}

export function addLine(line: Omit<CartLine, "id">): CartLine {
  const { nextLineNumber } = cart.get();
  const created: CartLine = { ...line, id: `line-${nextLineNumber}` };

  cart.update((state) => ({
    lines: [...state.lines, created],
    nextLineNumber: state.nextLineNumber + 1,
  }));

  return created;
}

export function removeLine(lineId: string): boolean {
  const { lines } = cart.get();
  if (!lines.some((line) => line.id === lineId)) return false;

  cart.update((state) => ({ ...state, lines: state.lines.filter((line) => line.id !== lineId) }));
  return true;
}

export function clearCart(): void {
  cart.update((state) => ({ ...state, lines: [] }));
}
