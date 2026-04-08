import { ErrorCode } from "../interpreter/error_codes.js";
import { InterpreterError } from "../interpreter/exceptions.js";
import { BuiltinMethod } from "../interpreter/types.js";
import { SolObject } from "./sol-object.js";

/**
 * Runtime representation of SOL26 Integer objects. Implements the Integer class in SOL26, including built-in methods for arithmetic operations, comparisons, and conversions.
 */
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
        (recv, args) => {
          if (args[0] instanceof SolInteger) {
            return new SolInteger((recv as SolInteger).value + args[0].value);
          }
          throw new InterpreterError(ErrorCode.INT_OTHER, "Operand must be an Integer");
        },
      ],
      [
        "minus:",
        (recv, args) => {
          if (args[0] instanceof SolInteger) {
            return new SolInteger((recv as SolInteger).value - args[0].value);
          }
          throw new InterpreterError(ErrorCode.INT_OTHER, "Operand must be an Integer");
        },
      ],
      [
        "multiplyBy:",
        (recv, args) => {
          if (args[0] instanceof SolInteger) {
            return new SolInteger((recv as SolInteger).value * args[0].value);
          }
          throw new InterpreterError(ErrorCode.INT_OTHER, "Operand must be an Integer");
        },
      ],
      [
        "divBy:",
        (recv, args) => {
          if (!(args[0] instanceof SolInteger)) {
            throw new InterpreterError(ErrorCode.INT_OTHER, "Operand must be an Integer");
          }
          const b = args[0].value;
          if (b === 0) throw new InterpreterError(ErrorCode.INT_INVALID_ARG, "Division by zero");
          return new SolInteger(Math.trunc((recv as SolInteger).value / b));
        },
      ],
      [
        "greaterThan:",
        (recv, args, interpreter) => {
          if (!(args[0] instanceof SolInteger)) {
            throw new InterpreterError(ErrorCode.INT_OTHER, "Operand must be an Integer");
          }
          return (recv as SolInteger).value > args[0].value
            ? interpreter.getTrue()
            : interpreter.getFalse();
        },
      ],
      [
        "equalTo:",
        (recv, args, interpreter) => {
          if (!(args[0] instanceof SolInteger)) {
            throw new InterpreterError(ErrorCode.INT_OTHER, "Operand must be an Integer");
          }
          return args[0].value === (recv as SolInteger).value
            ? interpreter.getTrue()
            : interpreter.getFalse();
        },
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
          // SOL26's timesRepeat: sends the message to the block argument, passing in the current iteration count (1-based) as an argument.
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
