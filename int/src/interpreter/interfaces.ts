import { SolObject } from "../sol26classes/sol-object.js";
import { Environment } from "./environment.js";
import { Block } from "./input_model.js";
import { BuiltinMethod } from "./types.js";

export interface RuntimeClass {
  name: string;
  parentName: string | null;
  userMethods: Map<string, Block>;
  builtinMethods: Map<string, BuiltinMethod>;
}

export interface ExecutionContext {
  env: Environment;
  selfRef: SolObject | null;
  definingClassName: string | null;
  lastBlockResult: SolObject | null;
}
