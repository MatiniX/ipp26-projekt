import { SolObject } from "../sol26classes/sol-object.js";
import { Block } from "./input_model.js";
import { Interpreter } from "./interpreter.js";

export type BuiltinMethod = (
  recv: SolObject,
  args: SolObject[],
  interpreter: Interpreter
) => SolObject;

export type MethodLookupResult =
  | { type: "user"; block: Block; definingClass: string }
  | { type: "builtin"; fn: BuiltinMethod; definingClass: string }
  | null;
