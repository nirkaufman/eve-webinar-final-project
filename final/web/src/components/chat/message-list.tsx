import { CalendarCheck, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

import { askChat } from "../../lib/chat-bridge";
import { DESK_PREFIX } from "../../lib/registration-flow";
import type { ChatMessage } from "../../lib/views";

const SUGGESTIONS = ["What passes do you have?", "I want to go zero to production", "I can't decide…"];

/** Presentation only. Renders the transcript. */
export function MessageList({
  messages,
  isThinking,
  runningTools,
}: {
  messages: readonly ChatMessage[];
  isThinking: boolean;
  runningTools: readonly string[];
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  const rendered = toRenderable(messages);

  return (
    <div className="messages">
      {rendered.length === 0 ? (
        <div className="empty-state">
          <p className="display">Thinking of coming?</p>
          <p>Tell me what you're after. I'll find the right pass, price it, and get you registered.</p>
          <div className="suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" className="chip" onClick={() => askChat(suggestion, { send: true })}>
                <Sparkles size={12} />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {rendered.map((message) => (
        <div
          key={message.id}
          className={`bubble ${
            message.fromDesk ? "bubble-desk" : message.role === "user" ? "bubble-user" : "bubble-agent"
          }`}
        >
          {message.fromDesk ? (
            <span className="tag">
              <CalendarCheck size={12} /> From the organizers
            </span>
          ) : null}
          {message.text}
        </div>
      ))}

      {isThinking ? (
        <div className="typing">
          <span className="dots">
            <span />
            <span />
            <span />
          </span>
          {runningTools.length > 0 ? <span className="tool-trace">{describeTools(runningTools)}</span> : null}
        </div>
      ) : null}

      <div ref={bottomRef} />
    </div>
  );
}

interface RenderableMessage {
  readonly id: string;
  readonly role: string;
  readonly text: string;
  readonly fromDesk: boolean;
}

/**
 * The desk's update arrives as a user message on this session, because that is
 * how you wake a durable conversation. The attendee should never read it — it is
 * addressed to the agent and carries an instruction. So we drop it, and badge
 * the agent's reply to it as a desk update instead.
 */
function toRenderable(messages: readonly ChatMessage[]): RenderableMessage[] {
  const rendered: RenderableMessage[] = [];
  let deskSpoke = false;

  for (const message of messages) {
    const text = message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part.text ?? "").trim())
      .filter((part) => part.length > 0)
      .join("\n\n");

    if (message.role === "user" && text.startsWith(DESK_PREFIX)) {
      deskSpoke = true;
      continue;
    }

    if (text.length === 0) continue;

    rendered.push({ id: message.id, role: message.role, text, fromDesk: deskSpoke });
    deskSpoke = false;
  }

  return rendered;
}

const TOOL_LABELS: Record<string, string> = {
  get_catalog: "checking the catalog",
  add_item: "pricing it up",
  remove_item: "updating your draft",
  register: "booking your seat",
  get_registration_status: "chasing your registration",
  eve__skill: "thinking about what fits",
};

function describeTools(tools: readonly string[]): string {
  const labels = [...new Set(tools.map((tool) => TOOL_LABELS[tool] ?? tool))];
  return `${labels.join(", ")}…`;
}
