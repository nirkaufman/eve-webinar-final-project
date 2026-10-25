import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * The catalog is reference data: tiers, formats and add-ons are the vocabulary
 * the agent is allowed to use. Anything the model says about what we sell, and
 * every price it quotes, has to come from these tables.
 */
export const tiers = sqliteTable("tiers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  blurb: text("blurb").notNull(),
  basePriceCents: integer("base_price_cents").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const formats = sqliteTable("formats", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  surchargeCents: integer("surcharge_cents").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const addons = sqliteTable("addons", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category", { enum: ["workshop", "mentoring", "social", "extras"] }).notNull(),
  priceCents: integer("price_cents").notNull(),
  highlight: integer("highlight", { mode: "boolean" }).notNull().default(false),
});

export const bundles = sqliteTable("bundles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  tierId: text("tier_id")
    .notNull()
    .references(() => tiers.id),
  formatId: text("format_id")
    .notNull()
    .references(() => formats.id),
  addonIds: text("addon_ids", { mode: "json" }).$type<string[]>().notNull(),
  badge: text("badge"),
});

/**
 * Registrations are the write side. `sessionId` is the eve session that placed
 * the registration, which is what lets the organizer desk talk back into the
 * attendee's own chat.
 */
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id"),
  attendeeName: text("attendee_name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  notes: text("notes"),
  status: text("status", {
    enum: ["received", "seat_confirmed", "materials_sent", "welcome_booked"],
  })
    .notNull()
    .default("received"),
  subtotalCents: integer("subtotal_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  placedAt: integer("placed_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  tierId: text("tier_id")
    .notNull()
    .references(() => tiers.id),
  formatId: text("format_id")
    .notNull()
    .references(() => formats.id),
  addonIds: text("addon_ids", { mode: "json" }).$type<string[]>().notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
});

export type Tier = typeof tiers.$inferSelect;
export type Format = typeof formats.$inferSelect;
export type Addon = typeof addons.$inferSelect;
export type Bundle = typeof bundles.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
