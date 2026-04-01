import { SolObject } from "./sol-object.js";

/**
 * Concrete SolObject for instances of user-defined classes (and Object itself).
 */
export class SolUserObject extends SolObject {
  constructor(className: string) {
    super();
    this.solClassName = className;
  }
}
