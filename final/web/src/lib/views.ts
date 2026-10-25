/**
 * The shapes the chat UI renders. The components only know these types; the
 * agent's tool results (read off the message stream in `agent-view.ts`) fill
 * them in.
 */

/** One message in the transcript. `parts` matches eve's message parts. */
export interface ChatMessage {
  readonly id: string;
  readonly role: string;
  readonly parts: readonly { readonly type: string; readonly text?: string }[];
}

export interface CartLineView {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly lineTotal: string;
}

export interface CartView {
  readonly lines: readonly CartLineView[];
  readonly subtotal: string;
  readonly total: string;
  readonly isEmpty: boolean;
}

export interface OrderView {
  readonly id: number;
  readonly status: string;
  readonly attendeeName: string;
  readonly email: string;
  readonly total: string;
  readonly items: readonly { name: string; quantity: number }[];
}

/** Something the agent is waiting on a person for: an approval or a question. */
export interface PendingRequest {
  readonly request: {
    readonly requestId: string;
    readonly prompt?: string;
    readonly options?: readonly { readonly id: string; readonly label: string }[];
  };
  readonly toolName: string;
  /** The arguments the tool is waiting to run with. */
  readonly input: unknown;
}

export interface CheckoutDetails {
  readonly attendeeName?: string;
  readonly email?: string;
  readonly company?: string;
  readonly notes?: string;
}

export function asCheckoutDetails(input: unknown): CheckoutDetails {
  return typeof input === "object" && input !== null ? (input as CheckoutDetails) : {};
}
