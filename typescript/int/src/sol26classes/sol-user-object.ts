import { SolFalse } from "./sol-false.js";
import { SolObject } from "./sol-object.js";

/**
 * Concrete SolObject for instances of user-defined classes (and Object itself).
 */
export class SolUserObject extends SolObject {
  constructor(className: string) {
    super();
    this.solClassName = className;
  }

  public equalTo(other: SolObject): boolean {
    return this === other;
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
  public isBoolean(): SolFalse {
    return SolFalse.instance;
  }
}
