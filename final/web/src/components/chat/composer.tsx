import { ArrowUp, Square } from "lucide-react";
import { useRef, useState } from "react";

import { useChatRequests } from "../../lib/chat-bridge";

/** Presentation only. Owns the input, not the sending. */
export function Composer({
  onSend,
  onCancel,
  disabled,
  isBusy,
}: {
  onSend: (message: string) => void;
  onCancel: () => void;
  disabled: boolean;
  isBusy: boolean;
}) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // "Add to chat" buttons and suggestion chips elsewhere on the page land here.
  useChatRequests(({ text, send }) => {
    if (send && !disabled) {
      onSend(text);
      return;
    }
    setValue(text);
    inputRef.current?.focus();
  });

  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        const message = value.trim();
        if (message.length === 0 || disabled) return;
        setValue("");
        onSend(message);
      }}
    >
      <input
        ref={inputRef}
        className="input"
        name="message"
        autoComplete="off"
        placeholder={isBusy ? "Add something…" : "What are you looking for?"}
        value={value}
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
      />

      {isBusy ? (
        <button type="button" className="btn btn-ghost btn-icon" onClick={onCancel} aria-label="Stop">
          <Square size={14} fill="currentColor" />
        </button>
      ) : (
        <button
          type="submit"
          className="btn btn-primary btn-icon"
          disabled={disabled || value.trim().length === 0}
          aria-label="Send"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      )}
    </form>
  );
}
