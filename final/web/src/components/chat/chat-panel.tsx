import { useEveAgent } from "eve/react";

import { EVE_HOST } from "../../lib/config";
import { selectCart, selectOrder, selectPendingRequests, selectRunningTools } from "../../lib/agent-view";
import type { OrderStatus } from "../../lib/registration-flow";
import { useRegistrationStatus } from "../../lib/use-registration-status";
import { ApprovalPrompt } from "./approval-prompt";
import { ChatFrame } from "./chat-frame";
import { Composer } from "./composer";
import { MessageList } from "./message-list";
import { DraftCard } from "../order/draft-card";
import { RegistrationTracker } from "../order/registration-tracker";

export function ChatPanel() {
  // The agent is a separate service. Point the hook at its origin; CORS on the
  // eve channel lets this browser talk to it directly.
  const agent = useEveAgent({ host: EVE_HOST });
  const { messages } = agent.data;

  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  // Everything below is read off the message stream. No extra React state.
  const cart = selectCart(messages);
  const runningTools = selectRunningTools(messages);
  const placedOrder = selectOrder(messages);
  const pendingRequests = selectPendingRequests(messages);

  // The desk moves the registration on and messages this session. When the
  // stage changes, re-attach so its reply shows up here.
  const liveStatus = useRegistrationStatus(placedOrder?.id ?? null, () => void agent.resume());
  const status = liveStatus ?? (placedOrder?.status as OrderStatus | undefined) ?? "received";

  return (
    <ChatFrame online onReset={messages.length > 0 ? () => agent.reset() : undefined}>
      {placedOrder ? (
        <RegistrationTracker orderId={placedOrder.id} status={status} total={placedOrder.total} />
      ) : cart && !cart.isEmpty ? (
        <DraftCard cart={cart} />
      ) : null}

      <MessageList messages={messages} isThinking={isBusy} runningTools={runningTools} />

      {pendingRequests.map((pending) => (
        <ApprovalPrompt
          key={pending.request.requestId}
          pending={pending}
          cart={cart}
          disabled={isResuming}
          onRespond={(optionId) => void agent.respond([{ requestId: pending.request.requestId, optionId }])}
        />
      ))}

      {agent.error ? <p className="error-note">{agent.error.message}</p> : null}

      <Composer
        disabled={isResuming}
        isBusy={isBusy}
        onCancel={() => void agent.cancel()}
        onSend={(message) => void agent.send(message, isBusy ? { turnPolicy: "steer" } : undefined)}
      />
    </ChatFrame>
  );
}
