import { Readable } from "node:stream";
import { SolInteger } from "./sol-integer.js";
import { SolObject } from "./sol-object.js";
import { BuiltinMethod } from "../interpreter/types.js";

export class SolString extends SolObject {
  private static inputStream: Readable | null = null;
  private static buffer: string = "";
  value: string;

  constructor(value: string = "") {
    super();
    this.solClassName = "String";
    this.value = value;
  }

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

    const idx = SolString.buffer.indexOf("\n");
    if (idx === -1) {
      // No newline found — return whatever remains
      const line = SolString.buffer;
      SolString.buffer = "";
      return new SolString(line);
    }
    const line = SolString.buffer.substring(0, idx);
    SolString.buffer = SolString.buffer.substring(idx + 1);
    return new SolString(line);
  }

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      [
        "print",
        (recv) => {
          process.stdout.write((recv as SolString).value);
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
          const startIndex = (args[0] as SolInteger).value - 1;
          const endIndex = (args[1] as SolInteger).value - 1;
          if (startIndex < 0 || endIndex < 0) {
            return interpreter.getNil();
          }
          if (endIndex - startIndex < 0) {
            return new SolString("");
          }

          return new SolString((recv as SolString).value.substring(startIndex, endIndex));
        },
      ],
      ["length", (recv) => new SolInteger((recv as SolString).value.length)],
      ["isString", (_recv, _args, interpreter) => interpreter.getTrue()],
      ["read", () => SolString.read()],
    ]);
  }
}
