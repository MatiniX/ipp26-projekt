import { BuiltinMethod } from "../interpreter/types.js";

/** Base class for all Sol objects. */
export class SolObject {
  public solClassName: string = "Object";
  public instanceAttributes = new Map<string, SolObject>();

  /**
   * Get the built-in methods for this class. Subclasses should override this to provide their own built-in methods.
   * @returns Map of method names to their implementations.
   */
  public static getbuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      [
        "identicalTo:",
        (recv, args, interpreter) =>
          recv === args[0] ? interpreter.getTrue() : interpreter.getFalse(),
      ],
      [
        "equalTo:",
        (recv, args, interpreter) =>
          recv === args[0] ? interpreter.getTrue() : interpreter.getFalse(),
      ],
      ["asString", (_recv, _args, interpreter) => interpreter.createString("")],
      ["isNumber", (_recv, _args, interpreter) => interpreter.getFalse()],
      ["isString", (_recv, _args, interpreter) => interpreter.getFalse()],
      ["isBlock", (_recv, _args, interpreter) => interpreter.getFalse()],
      ["isNil", (_recv, _args, interpreter) => interpreter.getFalse()],
      ["isBoolean", (_recv, _args, interpreter) => interpreter.getFalse()],
    ]);
  }
}
