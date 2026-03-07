import { ErrorCode } from "../interpreter/error_codes.js";
import { SolFalse } from "./sol-false.js";
import { SolObject } from "./sol-object.js";
import { SolTrue } from "./sol-true.js";

export class SolInteger extends SolObject {
  value: number;

  constructor(value: number = 0) {
    super();
    this.solClassName = "Integer";
    this.value = value;
  }

  public greaterThan(other: SolInteger): boolean {
    return this.value > other.value;
  }

  public plus(other: SolInteger): SolInteger {
    return new SolInteger(this.value + other.value);
  }

  public minus(other: SolInteger): SolInteger {
    return new SolInteger(this.value - other.value);
  }

  public multiplyBy(other: SolInteger): SolInteger {
    return new SolInteger(this.value * other.value);
  }

  public divBy(other: SolInteger): SolInteger | ErrorCode {
    if (other.value === 0) {
      //TODO: nvrátiť chybu 53
      return ErrorCode.INT_INVALID_ARG;
    }
    return new SolInteger(this.value / other.value);
  }

  public asInteger(): this {
    return this;
  }

  public asString(): string {
    return this.value.toString();
  }

  public equalTo(other: SolObject): boolean {
    return other instanceof SolInteger && this.value === other.value;
  }

  public isNumber(): SolTrue {
    return SolTrue.instance;
  }
  public isString(): SolFalse {
    return SolFalse.instance;
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
