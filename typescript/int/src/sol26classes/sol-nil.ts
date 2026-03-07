import { SolFalse } from "./sol-false.js";
import { SolObject } from "./sol-object.js";
import { SolTrue } from "./sol-true.js";

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

  public equalTo(other: SolObject): boolean {
    return other === SolNil.instance;
  }

  public asString(): string {
    return "nil";
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
  public isNil(): SolTrue {
    return SolTrue.instance;
  }
  public isBoolean(): SolFalse {
    return SolFalse.instance;
  }
}
