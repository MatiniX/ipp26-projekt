import type { Block } from "../interpreter/input_model.js";
import type { Environment } from "../interpreter/environment.js";
import { SolFalse } from "./sol-false.js";
import { SolObject } from "./sol-object.js";
import { SolTrue } from "./sol-true.js";

/**
 * Runtime representation of a SOL26 block.
 * Captures the block's AST, lexical environment (closure), self reference,
 * and the class in which the enclosing method is defined (for super dispatch).
 */
export class SolBlock extends SolObject {
  public readonly blockNode: Block;
  public readonly closureEnv: Environment;
  public readonly selfRef: SolObject | null;
  public readonly definingClassName: string | null;

  constructor(
    blockNode: Block,
    closureEnv: Environment,
    selfRef: SolObject | null = null,
    definingClassName: string | null = null
  ) {
    super();
    this.solClassName = "Block";
    this.blockNode = blockNode;
    this.closureEnv = closureEnv;
    this.selfRef = selfRef;
    this.definingClassName = definingClassName;
  }

  public get arity(): number {
    return this.blockNode.arity;
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
  public isBlock(): SolTrue {
    return SolTrue.instance;
  }
  public isNil(): SolFalse {
    return SolFalse.instance;
  }
  public isBoolean(): SolFalse {
    return SolFalse.instance;
  }
}
