import { BuiltinMethod } from "../interpreter/types.js";

export class SolObject {
  public solClassName: string = "Object";
  public instanceAttributes = new Map<string, SolObject>();

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
