import type { SolObject } from "../sol26classes/sol-object.js";
import { ErrorCode } from "./error_codes.js";

export class Environment {
  private variables = new Map<string, SolObject>();
  private params = new Set<string>();

  constructor(private parent: Environment | null = null) {}

  /** Define a formal parameter (immutable — assignment to it is error 34). */
  defineParameter(name: string, value: SolObject): void {
    this.params.add(name);
    this.variables.set(name, value);
  }

  /** Read a variable, walking up the scope chain. */
  get(name: string): SolObject | ErrorCode {
    const value = this.variables.get(name);
    if (value !== undefined) {
      return value;
    }
    if (this.parent) {
      return this.parent.get(name);
    }
    return ErrorCode.SEM_UNDEF;
  }

  /** Check if a name is a formal parameter anywhere in the scope chain. */
  isParameter(name: string): boolean {
    if (this.params.has(name)) return true;
    return this.parent?.isParameter(name) ?? false;
  }

  /** Assign to a variable — update existing in scope chain, or create in current scope. */
  set(name: string, value: SolObject): void {
    let parentEnv = this.parent;
    while (parentEnv !== null) {
      if (parentEnv.variables.has(name)) {
        parentEnv.variables.set(name, value);
        return;
      }
      parentEnv = parentEnv.parent;
    }

    this.variables.set(name, value);
  }
}
