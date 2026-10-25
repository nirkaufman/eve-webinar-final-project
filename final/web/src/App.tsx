import { useEffect, useState } from "react";

import { DeskPage } from "./components/desk-page";
import { Storefront } from "./components/storefront";

/**
 * Two screens, one tiny hash router — no routing library needed. `#/desk` shows
 * the organizer desk; anything else shows the storefront.
 */
export function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash.startsWith("#/desk") ? <DeskPage /> : <Storefront />;
}
