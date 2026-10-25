import { defineEval } from "eve/evals";

export default defineEval({
  description: "An undecided attendee triggers the recommend-a-pass skill, not a wall of catalog text.",
  async test(t) {
    const turn = await t.send("I can't decide. I'm a student and I just want to learn the basics.");

    t.succeeded();
    t.loadedSkill("recommend-a-pass");
    t.maxToolCalls(4);

    t.judge("The assistant recommends at most two specific passes by name and asks a follow-up question.", {
      on: turn.message,
    }).atLeast(0.7);
  },
});
