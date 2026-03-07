import { SolFalse } from "./sol-false.js";
import { SolTrue } from "./sol-true.js";

export abstract class SolObject {
  public solClassName: string = "Object";
  public instanceAttributes = new Map<string, SolObject>();

  public identicalTo(other: SolObject) {
    return this === other;
  }

  public asString() {
    return "";
  }

  public abstract equalTo(other: SolObject): boolean;

  public abstract isNumber(): SolFalse | SolTrue;

  public abstract isString(): SolFalse | SolTrue;

  public abstract isBlock(): SolFalse | SolTrue;

  public abstract isNil(): SolFalse | SolTrue;

  public abstract isBoolean(): SolFalse | SolTrue;
}
