import { TicketCheck } from "lucide-react";

import type { CartView } from "../../lib/views";

/** Presentation only. Shows the in-progress registration draft. */
export function DraftCard({ cart }: { cart: CartView }) {
  return (
    <div className="draft">
      <p className="eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <TicketCheck size={13} /> Your pass
      </p>

      <ul>
        {cart.lines.map((line) => (
          <li key={line.id}>
            <span>
              {line.quantity > 1 ? <span className="qty">{line.quantity}× </span> : null}
              {line.name}
            </span>
            <span className="tabular muted">{line.lineTotal}</span>
          </li>
        ))}
      </ul>

      <hr className="rule" />

      <div className="totals">
        <span>Total</span>
        <span className="tabular">{cart.total}</span>
      </div>
    </div>
  );
}
