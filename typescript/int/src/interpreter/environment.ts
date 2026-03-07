import type { SolObject } from "../sol26classes/sol-object.js";

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
  get(name: string): SolObject | undefined {
    const val = this.variables.get(name);
    if (val !== undefined) return val;
    return this.parent?.get(name);
  }

  /** Check if a name is a formal parameter anywhere in the scope chain. */
  isParameter(name: string): boolean {
    if (this.params.has(name)) return true;
    return this.parent?.isParameter(name) ?? false;
  }

  /** Assign to a variable — update existing in scope chain, or create in current scope. */
  set(name: string, value: SolObject): void {
    // Walk up to find existing variable
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let env: Environment | null = this;
    while (env !== null) {
      if (env.variables.has(name)) {
        env.variables.set(name, value);
        return;
      }
      env = env.parent;
    }
    // New variable — create in current scope
    this.variables.set(name, value);
  }
}
