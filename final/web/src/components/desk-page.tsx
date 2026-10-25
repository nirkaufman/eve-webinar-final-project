import { ClipboardList } from "lucide-react";

import { DeskBoard } from "./desk/desk-board";
import { SiteHeader } from "./site-header";

export function DeskPage() {
  return (
    <>
      <SiteHeader action={{ href: "#/", label: "Storefront" }} />

      <main className="container" style={{ paddingBottom: 64 }}>
        <div className="desk-head">
          <span className="mark">
            <ClipboardList size={24} />
          </span>
          <div>
            <h1 className="display">Organizer desk</h1>
            <p>Move a registration forward. The attendee hears about it in their own chat.</p>
          </div>
        </div>

        <DeskBoard />
      </main>
    </>
  );
}
