import { ErrorCode } from "../interpreter/error_codes.js";
import { InterpreterError } from "../interpreter/exceptions.js";
import { BuiltinMethod } from "../interpreter/types.js";
import { SolObject } from "./sol-object.js";

export class SolInteger extends SolObject {
  value: number;

  constructor(value: number = 0) {
    super();
    this.solClassName = "Integer";
    this.value = value;
  }

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      [
        "plus:",
        (recv, args) => new SolInteger((recv as SolInteger).value + (args[0] as SolInteger).value),
      ],
      [
        "minus:",
        (recv, args) => new SolInteger((recv as SolInteger).value - (args[0] as SolInteger).value),
      ],
      [
        "multiplyBy:",
        (recv, args) => new SolInteger((recv as SolInteger).value * (args[0] as SolInteger).value),
      ],
      [
        "divBy:",
        (recv, args) => {
          const b = (args[0] as SolInteger).value;
          if (b === 0) throw new InterpreterError(ErrorCode.INT_INVALID_ARG, "Division by zero");
          return new SolInteger(Math.trunc((recv as SolInteger).value / b));
        },
      ],
      [
        "greaterThan:",
        (recv, args, interpreter) =>
          (recv as SolInteger).value > (args[0] as SolInteger).value
            ? interpreter.getTrue()
            : interpreter.getFalse(),
      ],
      [
        "equalTo:",
        (recv, args, interpreter) =>
          args[0] instanceof SolInteger && (recv as SolInteger).value === args[0].value
            ? interpreter.getTrue()
            : interpreter.getFalse(),
      ],
      [
        "asString",
        (recv, _args, interpreter) =>
          interpreter.createString((recv as SolInteger).value.toString()),
      ],
      ["asInteger", (recv) => recv as SolInteger],
      [
        "timesRepeat:",
        (recv, args, interpreter) => {
          const n = (recv as SolInteger).value;
          let result: SolObject = interpreter.getNil();
          for (let i = 1; i <= n; i++) {
            result = interpreter.sendMessage(
              args[0] as SolObject,
              "value:",
              [new SolInteger(i)],
              null
            );
          }
          return result;
        },
      ],
      ["isNumber", (_recv, _args, interpreter) => interpreter.getTrue()],
    ]);
  }
}
