import type { EveMessage, EveMessagePart } from "eve/react";

import type { CartView, OrderView, PendingRequest } from "./views";

/**
 * The agent's tool results are the application's state.
 *
 * `add_item` and `remove_item` each return the whole draft; `register` returns
 * the placed registration. Instead of keeping a second copy in React, we read
 * the newest one straight off the message stream.
 */

const CART_TOOLS = ["add_item", "remove_item"];

function toolParts(messages: readonly EveMessage[]) {
  return messages.flatMap((message) => message.parts).filter(isToolPart);
}

function isToolPart(part: EveMessagePart): part is Extract<EveMessagePart, { type: "dynamic-tool" }> {
  return part.type === "dynamic-tool";
}

/** The draft as of the most recent draft-touching tool result. */
export function selectCart(messages: readonly EveMessage[]): CartView | null {
  const carts = toolParts(messages)
    .filter((part) => part.state === "output-available" && CART_TOOLS.includes(part.toolName))
    .map((part) => (part.output as { cart?: CartView } | undefined)?.cart)
    .filter((cart): cart is CartView => cart !== undefined);

  return carts.at(-1) ?? null;
}

/** Tool calls in flight, for the "…checking the catalog" line under the transcript. */
export function selectRunningTools(messages: readonly EveMessage[]): readonly string[] {
  return toolParts(messages)
    .filter((part) => part.state === "input-available" || part.state === "input-streaming")
    .map((part) => part.toolName);
}

/** The registration, once checkout has actually run. */
export function selectOrder(messages: readonly EveMessage[]): OrderView | null {
  const orders = toolParts(messages)
    .filter((part) => part.state === "output-available" && part.toolName === "register")
    .map((part) => (part.output as { order?: OrderView } | undefined)?.order)
    .filter((order): order is OrderView => order !== undefined);

  return orders.at(-1) ?? null;
}

/**
 * Approvals the agent is parked on. Scan every message: an approval can stay
 * open while later turns add newer messages below it.
 */
export function selectPendingRequests(messages: readonly EveMessage[]): readonly PendingRequest[] {
  return toolParts(messages).flatMap((part) => {
    if (part.state !== "approval-requested") return [];
    const request = part.toolMetadata?.eve?.inputRequest;
    return request ? [{ request, toolName: part.toolName, input: part.input }] : [];
  });
}
