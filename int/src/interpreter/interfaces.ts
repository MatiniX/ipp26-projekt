import { Block } from "./input_model.js";
import { BuiltinMethod } from "./types.js";

export interface RuntimeClass {
  name: string;
  parentName: string | null;
  userMethods: Map<string, Block>;
  builtinMethods: Map<string, BuiltinMethod>;
}
