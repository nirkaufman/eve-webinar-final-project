/**
 * Seed script: `npm run db:seed`.
 *
 * Wipes and repopulates the catalog so every viewer starts from the same
 * prices, and leaves the registrations tables empty. Safe to re-run any time.
 */
import { addons, bundles, db, formats, orderItems, orders, tiers } from "./index";

const TIERS = [
  { id: "student", name: "Student", blurb: "Valid .edu email. Everything Standard has, kinder price.", basePriceCents: 4900, sortOrder: 1 },
  { id: "standard", name: "Standard", blurb: "The full summit: every track, every keynote.", basePriceCents: 14900, sortOrder: 2 },
  { id: "pro", name: "Pro", blurb: "Standard, plus reserved seating and the speaker dinner.", basePriceCents: 29900, sortOrder: 3 },
];

const FORMATS = [
  { id: "online", name: "Online", description: "Join every session from anywhere. Streamed and recorded.", surchargeCents: 0, sortOrder: 1 },
  { id: "hybrid", name: "Hybrid", description: "On-site for the days you want, online for the rest.", surchargeCents: 3000, sortOrder: 2 },
  { id: "in-person", name: "In-person (Warsaw)", description: "Two days at the venue, meals and after-party included.", surchargeCents: 6000, sortOrder: 3 },
];

const ADDONS = [
  { id: "ztp-workshop", name: "Zero-to-Production Agent workshop", category: "workshop", priceCents: 9900, highlight: true },
  { id: "evals-workshop", name: "Evals deep-dive workshop", category: "workshop", priceCents: 8000, highlight: false },
  { id: "mentoring-hour", name: "1:1 mentoring hour", category: "mentoring", priceCents: 12000, highlight: false },
  { id: "office-hours", name: "Group office hours", category: "mentoring", priceCents: 3000, highlight: false },
  { id: "hackathon", name: "Hackathon ticket", category: "social", priceCents: 7500, highlight: true },
  { id: "speaker-dinner", name: "Speaker dinner seat", category: "social", priceCents: 9000, highlight: false },
  { id: "recordings", name: "Recording bundle", category: "extras", priceCents: 4000, highlight: false },
  { id: "certification", name: "Certification exam", category: "extras", priceCents: 5000, highlight: false },
  { id: "swag", name: "Swag pack", category: "extras", priceCents: 2500, highlight: false },
] as const;

const BUNDLES = [
  {
    id: "student-starter",
    name: "Student Starter",
    description: "Get your feet wet: online Student pass with the recordings to rewatch.",
    tierId: "student",
    formatId: "online",
    addonIds: ["recordings"],
    badge: "Best value",
  },
  {
    id: "the-builder",
    name: "The Builder",
    description: "For people who came to ship: the hands-on workshop, hackathon and swag.",
    tierId: "standard",
    formatId: "hybrid",
    addonIds: ["ztp-workshop", "hackathon", "swag"],
    badge: "Most popular",
  },
  {
    id: "the-founder",
    name: "The Founder",
    description: "The whole summit, in the room: workshop, mentoring, dinner and the exam.",
    tierId: "pro",
    formatId: "in-person",
    addonIds: ["ztp-workshop", "mentoring-hour", "speaker-dinner", "certification"],
    badge: "Pro",
  },
];

function seed() {
  db.transaction((tx) => {
    // Children first: order items reference orders, orders reference the catalog.
    tx.delete(orderItems).run();
    tx.delete(orders).run();
    tx.delete(bundles).run();
    tx.delete(addons).run();
    tx.delete(formats).run();
    tx.delete(tiers).run();

    tx.insert(tiers).values(TIERS).run();
    tx.insert(formats).values(FORMATS).run();
    tx.insert(addons).values(ADDONS.map((addon) => ({ ...addon }))).run();
    tx.insert(bundles).values(BUNDLES).run();
  });

  console.log(
    `Seeded ${TIERS.length} tiers, ${FORMATS.length} formats, ${ADDONS.length} add-ons, ${BUNDLES.length} bundles.`,
  );
}

seed();
