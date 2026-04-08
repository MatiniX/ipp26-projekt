import type { Block } from "../interpreter/input_model.js";
import type { Environment } from "../interpreter/environment.js";
import { SolObject } from "./sol-object.js";
import { BuiltinMethod } from "../interpreter/types.js";

/**
 * Runtime representation of a SOL26 block.
 * Captures the block's AST, environment (closure), self reference,
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

  public static getBuiltinMethods(): Map<string, BuiltinMethod> {
    return new Map<string, BuiltinMethod>([
      [
        "whileTrue:",
        (recv, args, interpreter) => {
          const condBlock = recv as SolBlock;
          let result: SolObject = interpreter.getNil();

          for (;;) {
            const cond = interpreter.invokeBlock(condBlock, []);
            if (cond !== interpreter.getTrue()) break;
            result = interpreter.sendMessage(args[0] as SolObject, "value", [], null);
          }
          return result;
        },
      ],
      ["isBlock", (_recv, _args, interpreter) => interpreter.getTrue()],
    ]);
  }
}
