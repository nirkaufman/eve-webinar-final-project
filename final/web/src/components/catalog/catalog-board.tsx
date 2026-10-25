import { Gift, GraduationCap, Layers, Plus, Ticket, Users, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { askChat } from "../../lib/chat-bridge";
import { fetchCatalog, type Catalog } from "../../lib/desk-api";
import { formatPrice } from "../../lib/format";

const BUNDLE_VARIANTS = ["v1", "v2", "v3"] as const;
const CATEGORY_ICONS = { workshop: Wrench, mentoring: Users, social: GraduationCap, extras: Gift } as const;

/** Presentation + one read. Renders the catalog from `GET /catalog`. */
export function CatalogBoard() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchCatalog().then(setCatalog).catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="card placeholder">
        Couldn&apos;t reach the agent&apos;s catalog. Is the eve dev server running on {" "}
        <code>VITE_EVE_HOST</code>?
      </div>
    );
  }

  if (!catalog) {
    return <div className="card placeholder">Loading the catalog…</div>;
  }

  const addonsByCategory = groupBy(catalog.addons, (addon) => addon.category);

  return (
    <div>
      <section className="section" style={{ marginTop: 0 }}>
        <div className="section-head">
          <p className="eyebrow">Ready-made</p>
          <h2 className="display">Pass bundles</h2>
        </div>

        <div className="bundle-grid">
          {catalog.bundles.map((bundle, index) => (
            <article key={bundle.id} className="card bundle-card">
              <div className={`bundle-top ${BUNDLE_VARIANTS[index % BUNDLE_VARIANTS.length]}`}>
                <Ticket className="glyph" size={46} strokeWidth={1.4} />
                {bundle.badge ? <span className="badge">{bundle.badge}</span> : null}
              </div>
              <div className="bundle-body">
                <h3>{bundle.name}</h3>
                <p>{bundle.description}</p>
                <div className="bundle-foot">
                  <span className="price">{formatPrice(priceBundle(catalog, bundle))}</span>
                  <button className="btn btn-primary" type="button" onClick={() => askChat(`I'd like the ${bundle.name}, please.`)}>
                    <Plus size={16} strokeWidth={2.5} /> Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <p className="eyebrow">Or build your own</p>
          <h2 className="display">Tiers, formats, add-ons</h2>
          <p className="muted" style={{ fontSize: "0.875rem", marginTop: 4, maxWidth: 520 }}>
            A tier, plus a format, plus any add-ons. Describe what you want in the chat and I&apos;ll price it as we go.
          </p>
        </div>

        <div className="option-grid">
          <div className="card option-card">
            <p className="head">
              <Layers size={16} /> Tiers
            </p>
            {catalog.tiers.map((tier) => (
              <div key={tier.id} className="option-row">
                <span>
                  {tier.name}
                  <span className="sub" style={{ display: "block" }}>
                    {tier.blurb}
                  </span>
                </span>
                <span className="tabular muted">{formatPrice(tier.basePriceCents)}</span>
              </div>
            ))}
          </div>

          <div className="card option-card">
            <p className="head">
              <Ticket size={16} /> Formats
            </p>
            {catalog.formats.map((format) => (
              <div key={format.id} className="option-row">
                <span>
                  {format.name}
                  <span className="sub" style={{ display: "block" }}>
                    {format.description}
                  </span>
                </span>
                <span className="tabular muted">
                  {format.surchargeCents === 0 ? "included" : `+${formatPrice(format.surchargeCents)}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          {Object.entries(addonsByCategory).map(([category, items]) => {
            const Icon = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS];
            return (
              <div key={category} className="addon-group">
                <p className="label">
                  <Icon size={14} /> {category}
                </p>
                <div className="addon-chips">
                  {items.map((addon) => (
                    <span key={addon.id} className="chip">
                      {addon.name}
                      <span className="price">{formatPrice(addon.priceCents)}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function priceBundle(catalog: Catalog, bundle: Catalog["bundles"][number]): number {
  const tier = catalog.tiers.find((t) => t.id === bundle.tierId);
  const format = catalog.formats.find((f) => f.id === bundle.formatId);
  const addons = bundle.addonIds
    .map((id) => catalog.addons.find((a) => a.id === id))
    .filter((a): a is Catalog["addons"][number] => a !== undefined);
  return (tier?.basePriceCents ?? 0) + (format?.surchargeCents ?? 0) + addons.reduce((sum, a) => sum + a.priceCents, 0);
}

function groupBy<T, K extends string>(items: readonly T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    (groups[key(item)] ??= []).push(item);
    return groups;
  }, {}) as Record<K, T[]>;
}
