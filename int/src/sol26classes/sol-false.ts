import { BuiltinMethod } from "../interpreter/types.js";
import { SolObject } from "./sol-object.js";

export class SolFalse extends SolObject {
  private static _instance: SolFalse | null;

  private constructor() {
    super();
    this.solClassName = "False";
  }

  public static get instance(): SolFalse {
    if (!SolFalse._instance) {
      SolFalse._instance = new SolFalse();
    }
    return SolFalse._instance;
  }

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      ["asString", (_recv, _args, interpreter) => interpreter.createString("false")],
      ["not", (_recv, _args, interpreter) => interpreter.getTrue()],
      ["and:", (_recv, _args, interpreter) => interpreter.getFalse()],
      [
        "or:",
        (_recv, args, interpreter) =>
          interpreter.sendMessage(args[0] as SolObject, "value", [], null),
      ],
      [
        "ifTrue:ifFalse:",
        (_recv, args, interpreter) =>
          interpreter.sendMessage(args[1] as SolObject, "value", [], null),
      ],
      ["isBoolean", (_recv, _args, interpreter) => interpreter.getTrue()],
    ]);
  }
}
