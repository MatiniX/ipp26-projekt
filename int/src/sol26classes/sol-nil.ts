import { BuiltinMethod } from "../interpreter/types.js";
import { SolObject } from "./sol-object.js";

export class SolNil extends SolObject {
  private static _instance: SolNil | null;

  private constructor() {
    super();
    this.solClassName = "Nil";
  }

  public static get instance(): SolNil {
    if (!SolNil._instance) {
      SolNil._instance = new SolNil();
    }
    return SolNil._instance;
  }

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      ["asString", (_recv, _args, interpreter) => interpreter.createString("nil")],
      ["isNil", (_recv, _args, interpreter) => interpreter.getTrue()],
    ]);
  }
}
