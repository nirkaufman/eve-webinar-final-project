import { useEffect, useRef, useState } from "react";

import { fetchOrder } from "./desk-api";
import type { OrderStatus } from "./registration-flow";

/**
 * Polls one registration's stage from `GET /orders/:id` while it is on screen,
 * and calls `onAdvance` whenever the organizer desk moves it forward. Returns
 * `null` until the first poll lands, or when `orderId` is null.
 */
export function useRegistrationStatus(orderId: number | null, onAdvance?: () => void): OrderStatus | null {
  const [polled, setPolled] = useState<{ orderId: number; status: OrderStatus } | null>(null);

  const onAdvanceRef = useRef(onAdvance);
  useEffect(() => {
    onAdvanceRef.current = onAdvance;
  });

  useEffect(() => {
    if (orderId === null) return;

    let cancelled = false;
    let seen: OrderStatus | null = null;

    const poll = async () => {
      try {
        const order = await fetchOrder(orderId);
        if (!order || cancelled) return;

        setPolled({ orderId, status: order.status });
        if (seen !== null && seen !== order.status) onAdvanceRef.current?.();
        seen = order.status;
      } catch {
        // A dropped poll is not worth surfacing; the next tick catches up.
      }
    };

    const timer = setInterval(poll, 4000);
    void poll();

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderId]);

  return polled?.orderId === orderId ? polled.status : null;
}
