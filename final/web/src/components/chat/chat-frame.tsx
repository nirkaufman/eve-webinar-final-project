import { MessageSquare, PlugZap, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Presentation only. The chat panel's chrome: header, online state, "Start
 * over". Whatever goes inside is up to `ChatPanel`.
 */
export function ChatFrame({
  online,
  onReset,
  children,
}: {
  online: boolean;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <section className="card chat-panel">
      <header className="chat-head">
        <div className="who">
          <span className="avatar">
            <MessageSquare size={19} />
            <span className={`status-dot ${online ? "online" : ""}`} />
          </span>
          <div>
            <p className="display" style={{ fontSize: "1rem", lineHeight: 1.1 }}>
              Pass concierge
            </p>
            <p className="tool-trace">{online ? "Online · knows the catalog" : "Offline"}</p>
          </div>
        </div>

        {onReset ? (
          <button type="button" className="btn btn-quiet" onClick={onReset}>
            <RotateCcw size={12} /> Start over
          </button>
        ) : null}
      </header>

      {online ? null : (
        <div className="offline-note">
          <PlugZap size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0 }}>
            <strong>No agent connected yet.</strong> Connecting the standalone eve agent to this panel is the
            finale — see the code lab, Act 2.
          </p>
        </div>
      )}

      {children}
    </section>
  );
}
