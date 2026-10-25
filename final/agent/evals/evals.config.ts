import { anthropic } from "@ai-sdk/anthropic";
import { defineEvalConfig } from "eve/evals";

export default defineEvalConfig({
  // A second, cheaper model grades the fuzzy assertions. It never grades itself.
  judge: { model: anthropic.decisionModel("claude-haiku-5-5") },
  timeoutMs: 120_000,
});
