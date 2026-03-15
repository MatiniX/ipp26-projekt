import { SolObject } from "../sol26classes/sol-object.js";
import { Interpreter } from "./interpreter.js";

export type BuiltinMethod = (
  recv: SolObject,
  args: SolObject[],
  interpreter: Interpreter
) => SolObject;
