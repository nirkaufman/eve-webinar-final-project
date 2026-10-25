import { Sparkles } from "lucide-react";

/** Presentation only. The AI Poland wordmark and a nav action. */
export function SiteHeader({ action }: { action?: { href: string; label: string } }) {
  return (
    <header className="site-header">
      <div className="container inner">
        <a className="brand" href="#/">
          <span className="brand-mark">AI</span>
          <span className="wordmark">
            AI <span>Poland</span>
          </span>
        </a>

        <div className="header-actions">
          <span className="header-tag">
            <Sparkles size={14} color="var(--accent)" /> Zero to Production · Warsaw
          </span>
          {action ? (
            <a className="btn btn-ghost" href={action.href}>
              {action.label}
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
