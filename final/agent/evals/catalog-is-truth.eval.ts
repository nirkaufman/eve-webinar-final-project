import { defineEval } from "eve/evals";

export default defineEval({
  description: "The agent reads the catalog before talking about it, and refuses what we do not offer.",
  async test(t) {
    const session = await t.session();

    await session.send("What passes do you have?");
    t.calledTool("get_catalog");

    const parking = await session.send("Can I add on-site parking to that?");
    parking.succeeded();
    t.judge(
      "The assistant says parking is not something it offers and does not quote a price for parking. Prices for real add-ons are fine.",
      { on: parking.message },
    ).atLeast(0.7);
  },
});
