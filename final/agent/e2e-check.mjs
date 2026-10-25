import { Client } from "eve/client";

const host = "http://127.0.0.1:2000";
const client = new Client({ host });

function textOf(message) {
  if (!message) return "";
  if (typeof message === "string") return message.trim();
  const parts = message.parts || [];
  return parts.filter((p) => p.type === "text").map((p) => p.text || "").join(" ").trim();
}

const health = await client.health();
console.log("health:", health.status);

// Turn 1 — build a pass.
const { session, response } = await client.sessions.create({
  message: "I'd like the Standard online pass, please — add it to my draft.",
});
const r1 = await response.result();
console.log("turn1:", r1.status, "—", textOf(r1.message).slice(0, 140));

// Turn 2 — register. This parks on approval.
const reg = await session.send("Register me. I'm Dana Kowalski, email dana@example.com.");
let pending = [];
for await (const ev of reg) {
  if (ev.type === "input.requested") pending = ev.data.requests;
}
console.log("register parked →", pending.map((p) => p.toolName ?? p.kind));

// Approve it.
const resumed = await session.respond(pending.map((req) => ({ requestId: req.requestId, optionId: "approve" })));
const r2 = await resumed.result();
console.log("after approve:", r2.status, "—", textOf(r2.message).slice(0, 180));

// The desk reads the order (custom channel GET /orders).
const orders = await (await fetch(`${host}/orders`)).json();
const order = orders[0];
console.log("order:", { id: order.id, status: order.status, boundToSession: order.sessionId === session.id });

// The desk advances it (custom channel POST /orders/:id/advance → durable push-back).
const adv = await (await fetch(`${host}/orders/${order.id}/advance`, { method: "POST" })).json();
console.log("advance →", { status: adv.status, notified: adv.notified });

// Observe the push-back land as a new agent turn on the attendee's session.
let deskReply = "";
const deadline = Date.now() + 20000;
for await (const ev of session.stream({ follow: true })) {
  if (ev.type === "message.completed") {
    const msg = ev.data?.message;
    const text = textOf(msg);
    if (msg?.role === "assistant" && text && !text.startsWith("[desk]")) deskReply = text;
  }
  if (Date.now() > deadline) break;
}
console.log("PUSH-BACK agent reply:", deskReply.slice(0, 220));
process.exit(0);
