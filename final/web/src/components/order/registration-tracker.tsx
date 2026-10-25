import { Check, Mail, PartyPopper, Ticket, UserCheck } from "lucide-react";

import { ORDER_FLOW, ORDER_STATUS_LABELS } from "../../lib/registration-flow";
import type { OrderStatus } from "../../lib/registration-flow";

const STAGE_ICONS = {
  received: Ticket,
  seat_confirmed: UserCheck,
  materials_sent: Mail,
  welcome_booked: PartyPopper,
} as const;

/** Presentation only. The four-stage registration timeline. */
export function RegistrationTracker({
  orderId,
  status,
  total,
}: {
  orderId: number;
  status: OrderStatus;
  total: string;
}) {
  const currentIndex = ORDER_FLOW.indexOf(status);

  return (
    <div className="tracker">
      <div className="top">
        <span className="reg">Registration #{orderId}</span>
        <span className="tabular" style={{ fontWeight: 600 }}>
          {total}
        </span>
      </div>

      <ol className="tracker-steps">
        {ORDER_FLOW.map((stage, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = isDone ? Check : STAGE_ICONS[stage];

          return (
            <li key={stage} className={`tracker-step ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
              <span className="node">
                <Icon size={15} />
              </span>
              <span className="label">{ORDER_STATUS_LABELS[stage]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
