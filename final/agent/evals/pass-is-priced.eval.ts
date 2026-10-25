import { defineEval } from "eve/evals";

export default defineEval({
  description: "A described pass becomes exactly one priced draft line with the right tier and format.",
  async test(t) {
    const session = await t.session();

    await session.send("I want the in-person Pro pass with the hands-on workshop.");
    await session.send("Yes, add that to my draft.");

    // Assert on the whole run: which turn adds the pass is the model's call.
    // Assert on the output (the resolved pass), not on how the call was phrased.
    t.calledTool("add_item", {
      output: { added: { tierId: "pro", formatId: "in-person" } },
      count: 1,
    });
    t.toolOrder(["get_catalog", "add_item"]);

    const total = await session.send("What's my total?");
    total.succeeded();
    total.messageIncludes(/\$\d+\.\d{2}/);
  },
});
