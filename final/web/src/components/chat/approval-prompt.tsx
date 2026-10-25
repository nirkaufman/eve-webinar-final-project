import { Mail, MessageCircleQuestion, TicketCheck } from "lucide-react";

import type { CartView, PendingRequest } from "../../lib/views";
import { asCheckoutDetails } from "../../lib/views";

/**
 * Presentation only. Renders whatever the agent is waiting on. For registration
 * it writes its own copy from the tool's arguments; for anything else it falls
 * back to the agent's prompt. eve handles the protocol; the app chooses the words.
 */
export function ApprovalPrompt({
  pending,
  cart,
  onRespond,
  disabled,
}: {
  pending: PendingRequest;
  cart: CartView | null;
  onRespond: (optionId: string) => void;
  disabled: boolean;
}) {
  const isCheckout = pending.toolName === "register";
  const details = asCheckoutDetails(pending.input);

  return (
    <div className={`approval ${isCheckout ? "checkout" : ""}`}>
      <p className="eyebrow">
        {isCheckout ? <TicketCheck size={13} /> : <MessageCircleQuestion size={13} />}
        {isCheckout ? "Confirm your registration" : "Quick question"}
      </p>

      {isCheckout ? (
        <div>
          {cart ? <p className="total">{cart.total}</p> : null}
          <p className="who">
            <Mail size={14} />
            <span>
              {details.attendeeName}
              {details.email ? ` · ${details.email}` : null}
              {details.company ? ` · ${details.company}` : null}
            </span>
          </p>
          {details.notes ? <p className="tool-trace">Note: {details.notes}</p> : null}
        </div>
      ) : (
        <p style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>{pending.request.prompt}</p>
      )}

      <div className="actions">
        {(pending.request.options ?? []).map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            className={`btn ${option.id === "approve" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => onRespond(option.id)}
          >
            {isCheckout && option.id === "approve" ? "Register me" : option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
