import { SolFalse } from "./sol-false.js";
import { SolObject } from "./sol-object.js";

export class SolTrue extends SolObject {
  private static _instance: SolTrue | null;

  private constructor() {
    super();
    this.solClassName = "True";
  }

  public static get instance(): SolTrue {
    if (!SolTrue._instance) {
      SolTrue._instance = new SolTrue();
    }
    return SolTrue._instance;
  }

  public asString(): string {
    return "true";
  }

  public not(): SolFalse {
    return SolFalse.instance;
  }

  public and(other: SolObject): SolTrue | SolFalse {
    throw new Error("Not implemented" + other.asString());
  }

  public or(): SolTrue {
    return SolTrue.instance;
  }

  public equalTo(other: SolObject): boolean {
    return other instanceof SolTrue && other === SolTrue.instance;
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
