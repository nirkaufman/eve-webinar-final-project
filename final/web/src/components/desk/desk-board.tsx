import { Building2, MessageCircle, StickyNote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { advanceOrder, fetchOrders, type DeskOrder } from "../../lib/desk-api";
import { formatPrice } from "../../lib/format";
import { ORDER_STATUS_LABELS, nextStatus } from "../../lib/registration-flow";

/** The one screen an organizer actually uses: the registration queue. */
export function DeskBoard() {
  const [orders, setOrders] = useState<DeskOrder[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await fetchOrders());
    } catch {
      // Leave the last good list on screen; the next poll retries.
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [load]);

  async function advance(orderId: number) {
    setBusyId(orderId);
    try {
      await advanceOrder(orderId);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <p className="card placeholder">
        No registrations yet. Go register for a pass in the concierge — they show up here.
      </p>
    );
  }

  return (
    <ul className="desk-grid" style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {orders.map((order) => {
        const next = nextStatus(order.status);
        const isDone = next === null;

        return (
          <li key={order.id} className={`card ticket ${isDone ? "done" : ""}`}>
            <div className="ticket-head">
              <span className="num">#{order.id}</span>
              <span className={isDone ? "badge badge-green" : "badge"}>{ORDER_STATUS_LABELS[order.status]}</span>
            </div>

            <div className="ticket-body">
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    <span className="qty">{item.quantity}×</span> {item.name}
                  </li>
                ))}
              </ul>

              <p className="ticket-meta">
                <Building2 size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                {order.attendeeName}
                {order.company ? ` · ${order.company}` : ""} · {order.email}
              </p>

              {order.notes ? (
                <p className="ticket-meta">
                  <StickyNote size={13} style={{ marginTop: 2, flexShrink: 0 }} /> {order.notes}
                </p>
              ) : null}

              {order.sessionId ? (
                <p className="tool-trace" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <MessageCircle size={12} /> Registered by chat
                </p>
              ) : null}

              <div className="ticket-foot">
                <span className="tabular" style={{ fontWeight: 600, fontSize: "1rem" }}>
                  {formatPrice(order.totalCents)}
                </span>
                {next ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={busyId === order.id}
                    onClick={() => void advance(order.id)}
                  >
                    {busyId === order.id ? "Sending…" : `→ ${ORDER_STATUS_LABELS[next]}`}
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
