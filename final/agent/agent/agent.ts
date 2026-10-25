import { anthropic } from "@ai-sdk/anthropic";
import { defineAgent } from "eve";

export default defineAgent({
  model: anthropic("claude-sonnet-5-5"),

  // A registration desk needs no shell, no file system and no web access.
  // Turning the optional built-ins off means a prompt injection has nothing to
  // reach — and `npx eve info` drops from 7 tools to just ours.
  defaultTools: false,

  build: {
    // better-sqlite3 is a native module: keep it external so eve ships the
    // prebuilt binary instead of trying to bundle it.
    externalDependencies: ["better-sqlite3"],
  },
});
