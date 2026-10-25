import { defineEval } from "eve/evals";

export default defineEval({
  description: "Registration parks for approval, and only writes the row once the attendee approves.",
  async test(t) {
    const session = await t.session();

    await session.send("A Standard online pass, please.");
    await session.send("Yes, add it.");
    const checkout = await session.send("Register me. Name's Dana Kowalski, email dana@example.com.");

    // That turn is parked, not finished: register is waiting on a person.
    checkout.parked();
    const request = await session.requireInputRequest({ toolName: "register" });

    const approved = await session.respond([{ requestId: request.requestId, optionId: "approve" }]);
    approved.succeeded();
    approved.calledTool("register", { status: "completed", count: 1 });
    approved.messageIncludes(/(#|number\s*)\d+/i);
  },
});
