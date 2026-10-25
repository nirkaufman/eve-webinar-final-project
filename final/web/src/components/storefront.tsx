import { Flame, Globe, Sparkles } from "lucide-react";

import { CatalogBoard } from "./catalog/catalog-board";
import { ChatPanel } from "./chat/chat-panel";
import { SiteHeader } from "./site-header";

export function Storefront() {
  return (
    <>
      <SiteHeader action={{ href: "#/desk", label: "Organizer desk" }} />

      <main className="container layout">
        <div style={{ minWidth: 0 }}>
          <section className="hero">
            <div className="hero-inner">
              <p className="eyebrow">AI Poland Summit · Warsaw &amp; Online</p>
              <h1 className="hero-title">
                Zero to Production,
                <br />
                in two days.
              </h1>
              <p>
                Register by chat. Pick a ready-made pass or describe what you need, and the concierge prices it and
                signs you up.
              </p>
              <div className="pills">
                <span className="pill">
                  <Flame size={14} /> Hands-on workshops
                </span>
                <span className="pill">
                  <Globe size={14} /> Online or in the room
                </span>
                <span className="pill">
                  <Sparkles size={14} /> Build a real agent
                </span>
              </div>
            </div>
          </section>

          <CatalogBoard />
        </div>

        <ChatPanel />
      </main>
    </>
  );
}
