import { defineSandbox } from "eve/sandbox";
import { JustBashSandbox } from "eve/sandbox/just-bash";

// This agent never runs code, so it gets the lightest sandbox there is: a
// pure-JavaScript shell with no container or VM. Same on every laptop.
export const environment = JustBashSandbox.environment();
export default defineSandbox(() => environment.open());
