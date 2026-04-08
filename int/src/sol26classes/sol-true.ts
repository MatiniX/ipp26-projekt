import { BuiltinMethod } from "../interpreter/types.js";
import { SolObject } from "./sol-object.js";

/**
 * Runtime representation of the singleton True object. Implements the True class in SOL26.
 */
export class SolTrue extends SolObject {
  private static _instance: SolTrue | null;

  private constructor() {
    super();
    this.solClassName = "True";
  }

  public static get instance(): SolTrue {
    if (!SolTrue._instance) {
      SolTrue._instance = new SolTrue();
    }
    return SolTrue._instance;
  }

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      ["asString", (_recv, _args, interpreter) => interpreter.createString("true")],
      ["not", (_recv, _args, interpreter) => interpreter.getFalse()],
      [
        "and:",
        (_recv, args, interpreter) =>
          interpreter.sendMessage(args[0] as SolObject, "value", [], null),
      ],
      ["or:", (_recv, _args, interpreter) => interpreter.getTrue()],
      [
        "ifTrue:ifFalse:",
        (_recv, args, interpreter) =>
          interpreter.sendMessage(args[0] as SolObject, "value", [], null),
      ],
      ["isBoolean", (_recv, _args, interpreter) => interpreter.getTrue()],
    ]);
  }
}
