import { Readable } from "node:stream";
import { SolInteger } from "./sol-integer.js";
import { SolObject } from "./sol-object.js";
import { BuiltinMethod } from "../interpreter/types.js";
import { InterpreterError } from "../interpreter/exceptions.js";
import { ErrorCode } from "../interpreter/error_codes.js";

export class SolString extends SolObject {
  private static inputStream: Readable | null = null;
  private static buffer: string = "";
  value: string;

  constructor(value: string = "") {
    super();
    this.solClassName = "String";
    this.value = value;
  }

  /**
   * Initialize the input stream for SolString read operations. This should be called before executing the program, with the user input stream (e.g., process.stdin).
   * @param stream User input stream to read from.
   */
  static setInputStream(stream: Readable): void {
    SolString.inputStream = stream;
    SolString.buffer = "";
  }

  static read(): SolString {
    // Pull data from stream into buffer until we have a full line (or stream is exhausted)
    while (!SolString.buffer.includes("\n") && SolString.inputStream) {
      const chunk: unknown = SolString.inputStream.read();
      if (chunk === null) {
        SolString.inputStream = null;
        break;
      }
      if (typeof chunk === "string") {
        SolString.buffer += chunk;
      } else if (chunk instanceof Buffer) {
        SolString.buffer += chunk.toString();
      }
    }

    //User input is expected to be split by newlines.
    const idx = SolString.buffer.indexOf("\n");
    if (idx === -1) {
      // No newline found — return whatever remains
      const line = SolString.buffer;
      SolString.buffer = "";
      return new SolString(line);
    }
    const line = SolString.buffer.substring(0, idx);
    //Advance buffer past the consumed line and newline character
    SolString.buffer = SolString.buffer.substring(idx + 1);
    return new SolString(line);
  }

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      [
        "print",
        (recv) => {
          const strVal = (recv as SolString).value;
          // '\\' -> '\'
          // '\n' -> native newline
          // '\'' -> '''
          const decoded = strVal.replace(/\\(.)/g, (match, p1) => {
            if (p1 === "n") return "\n";
            if (p1 === "\\") return "\\";
            if (p1 === "'") return "'";
            return match;
          });
          process.stdout.write(decoded);
          return recv;
        },
      ],
      [
        "equalTo:",
        (recv, args, interpreter) =>
          args[0] instanceof SolString && (recv as SolString).value === args[0].value
            ? interpreter.getTrue()
            : interpreter.getFalse(),
      ],
      ["asString", (recv) => recv],
      [
        "asInteger",
        (recv, _args, interpreter) => {
          const num = parseInt((recv as SolString).value, 10);
          if (isNaN(num)) {
            return interpreter.getNil();
          }
          return new SolInteger(num);
        },
      ],
      [
        "concatenateWith:",
        (recv, args, interpreter) => {
          if (!(args[0] instanceof SolString)) return interpreter.getNil();
          return new SolString((recv as SolString).value + args[0].value);
        },
      ],
      [
        "startsWith:endsBefore:",
        (recv, args, interpreter) => {
          if (args[0] instanceof SolInteger && args[1] instanceof SolInteger) {
            //SOL26 uses 1-based indexing for strings
            const startIndex = args[0].value - 1;
            const endIndex = args[1].value - 1;
            if (startIndex < 0 || endIndex < 0) {
              return interpreter.getNil();
            }
            if (endIndex - startIndex <= 0) {
              return new SolString("");
            }

            return new SolString((recv as SolString).value.substring(startIndex, endIndex));
          }
          throw new InterpreterError(ErrorCode.INT_OTHER, "Arguments must be Integers");
        },
      ],
      ["length", (recv) => new SolInteger((recv as SolString).value.length)],
      ["isString", (_recv, _args, interpreter) => interpreter.getTrue()],
      ["read", () => SolString.read()],
    ]);
  }
}
