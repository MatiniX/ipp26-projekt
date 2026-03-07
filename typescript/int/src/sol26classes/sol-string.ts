import { Readable } from "node:stream";
import { SolInteger } from "./sol-integer.js";
import { SolNil } from "./sol-nil.js";
import { SolObject } from "./sol-object.js";
import { SolFalse } from "./sol-false.js";
import { SolTrue } from "./sol-true.js";

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

  public print(): this {
    process.stdout.write(this.value);
    return this;
  }

  public asString(): string {
    return this.value;
  }

  public asInteger(): SolInteger | SolNil {
    const num = parseInt(this.value, 10);
    if (isNaN(num)) {
      return SolNil.instance;
    }
    return new SolInteger(num);
  }

  public concatenateWith(other: SolString): SolString {
    return new SolString(this.value + other.value);
  }

  public substring(start: number, end: number): SolString | SolNil {
    const startIndex = start - 1;
    const endIndex = end - 1;
    if (startIndex < 0 || endIndex < 0) {
      return SolNil.instance;
    }
    if (endIndex - startIndex < 0) {
      return new SolString("");
    }

    return new SolString(this.value.substring(startIndex, endIndex));
  }

  public length(): SolInteger {
    return new SolInteger(this.value.length);
  }

  public equalTo(other: SolObject): boolean {
    return other instanceof SolString && this.value === other.value;
  }
  public isNumber(): SolFalse {
    return SolFalse.instance;
  }
  public isString(): SolTrue {
    return SolTrue.instance;
  }
  public isBlock(): SolFalse {
    return SolFalse.instance;
  }
  public isNil(): SolFalse {
    return SolFalse.instance;
  }
  public isBoolean(): SolFalse {
    return SolFalse.instance;
  }
}
