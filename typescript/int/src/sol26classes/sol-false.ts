import { SolObject } from "./sol-object.js";
import { SolTrue } from "./sol-true.js";

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

  public asString(): string {
    return "false";
  }

  public not(): SolTrue {
    return SolTrue.instance;
  }

  public and(): SolFalse {
    return SolFalse.instance;
  }

  public or(other: SolObject): SolTrue | SolFalse {
    throw new Error("Not implemented" + other.asString());
  }

  public equalTo(other: SolObject): boolean {
    return other === SolFalse.instance;
  }
  public isNumber(): SolFalse {
    return SolFalse.instance;
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
  public isBoolean(): SolTrue {
    return SolTrue.instance;
  }
}
