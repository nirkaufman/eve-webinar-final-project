import { useEffect, useRef } from "react";

/**
 * Lets any part of the page talk to the chat composer — the "Add to chat"
 * buttons on the catalog, the suggestion chips in an empty chat — without
 * threading props through the layout.
 *
 * `send: false` drops the text into the input for the attendee to finish.
 * `send: true` sends it straight away.
 */
export interface ChatRequest {
  readonly text: string;
  readonly send: boolean;
}

const EVENT = "aipoland:chat";

export function askChat(text: string, { send = false }: { send?: boolean } = {}): void {
  window.dispatchEvent(new CustomEvent<ChatRequest>(EVENT, { detail: { text, send } }));
}

export function useChatRequests(handler: (request: ChatRequest) => void): void {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const listener = (event: Event) => handlerRef.current((event as CustomEvent<ChatRequest>).detail);
    window.addEventListener(EVENT, listener);
    return () => window.removeEventListener(EVENT, listener);
  }, []);
}
