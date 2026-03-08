/**
 * This module contains the main logic of the interpreter.
 *
 * IPP: You must definitely modify this file. Bend it to your will.
 *
 * Author: Ondřej Ondryáš <iondryas@fit.vut.cz>
 * Author:
 */

import { readFileSync } from "node:fs";
import type { Readable } from "node:stream";

import { ErrorCode } from "./error_codes.js";
import { Environment } from "./environment.js";
import { InterpreterError } from "./exceptions.js";
import {
  InvalidXmlError,
  ModelValidationError,
  parseProgramXml,
  type Assign,
  type Block,
  type Expr,
  type Literal,
  type Program,
  type Var,
} from "./input_model.js";
import { getLogger } from "./logging.js";
import { SolBlock } from "../sol26classes/sol-block.js";
import { SolFalse } from "../sol26classes/sol-false.js";
import { SolInteger } from "../sol26classes/sol-integer.js";
import { SolNil } from "../sol26classes/sol-nil.js";
import { SolObject } from "../sol26classes/sol-object.js";
import { SolString } from "../sol26classes/sol-string.js";
import { SolTrue } from "../sol26classes/sol-true.js";
import { SolUserObject } from "../sol26classes/sol-user-object.js";

const logger = getLogger("interpreter");

// ── Types ──────────────────────────────────────────────────────────────────

type BuiltinMethod = (recv: SolObject, args: SolObject[]) => SolObject;

interface RuntimeClass {
  name: string;
  parentName: string | null;
  userMethods: Map<string, Block>;
  builtinMethods: Map<string, BuiltinMethod>;
}

type MethodLookupResult =
  | { type: "user"; block: Block; definingClass: string }
  | { type: "builtin"; fn: BuiltinMethod; definingClass: string }
  | null;

// ── Interpreter ────────────────────────────────────────────────────────────

export class Interpreter {
  public currentProgram: Program | null = null;
  private classRegistry = new Map<string, RuntimeClass>();

  // ── Loading ──────────────────────────────────────────────────────────────

  public loadProgram(sourceFilePath: string): void {
    logger.info("Opening source file:", sourceFilePath);
    try {
      const sourceText = readFileSync(sourceFilePath, "utf8");
      this.currentProgram = parseProgramXml(sourceText);
    } catch (error) {
      if (error instanceof InvalidXmlError) {
        throw new InterpreterError(ErrorCode.INT_XML, "Error parsing input XML");
      }
      if (error instanceof ModelValidationError) {
        throw new InterpreterError(ErrorCode.INT_STRUCTURE, "Invalid SOL-XML structure");
      }
      throw error;
    }
  }

  // ── Execution entry point ────────────────────────────────────────────────

  public execute(inputIo: Readable): void {
    logger.info("Executing program");
    SolString.setInputStream(inputIo);

    this.registerBuiltinClasses();
    this.registerUserClasses();

    // Validate Main class and run method
    if (!this.lookupMethod("Main", "run")) {
      throw new InterpreterError(ErrorCode.SEM_MAIN, "Missing Main class or its run method");
    }

    const mainInstance = new SolUserObject("Main");
    this.sendMessage(mainInstance, "run", [], null);
  }

  // ── Class registration ───────────────────────────────────────────────────

  private registerBuiltinClasses(): void {
    // ─ Object ─
    this.classRegistry.set("Object", {
      name: "Object",
      parentName: null,
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        [
          "identicalTo:",
          (recv, args) =>
            recv.identicalTo(args[0] as SolObject) ? SolTrue.instance : SolFalse.instance,
        ],
        [
          "equalTo:",
          (recv, args) =>
            recv.equalTo(args[0] as SolObject) ? SolTrue.instance : SolFalse.instance,
        ],
        ["asString", (recv) => new SolString(recv.asString())],
        ["isNumber", (recv) => recv.isNumber()],
        ["isString", (recv) => recv.isString()],
        ["isBlock", (recv) => recv.isBlock()],
        ["isNil", (recv) => recv.isNil()],
        ["isBoolean", (recv) => recv.isBoolean()],
      ]),
    });

    // ─ Integer ─
    this.classRegistry.set("Integer", {
      name: "Integer",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        ["plus:", (recv, args) => (recv as SolInteger).plus(args[0] as SolInteger)],
        ["minus:", (recv, args) => (recv as SolInteger).minus(args[0] as SolInteger)],
        ["multiplyBy:", (recv, args) => (recv as SolInteger).multiplyBy(args[0] as SolInteger)],
        [
          "divBy:",
          (recv, args) => {
            const b = (args[0] as SolInteger).value;
            if (b === 0) throw new InterpreterError(ErrorCode.INT_INVALID_ARG, "Division by zero");
            return new SolInteger(Math.trunc((recv as SolInteger).value / b));
          },
        ],
        [
          "greaterThan:",
          (recv, args) =>
            (recv as SolInteger).greaterThan(args[0] as SolInteger)
              ? SolTrue.instance
              : SolFalse.instance,
        ],
        [
          "equalTo:",
          (recv, args) =>
            args[0] instanceof SolInteger && (recv as SolInteger).value === args[0].value
              ? SolTrue.instance
              : SolFalse.instance,
        ],
        ["asString", (recv) => new SolString((recv as SolInteger).asString())],
        ["asInteger", (recv) => recv],
        [
          "timesRepeat:",
          (recv, args) => {
            const n = (recv as SolInteger).value;
            let result: SolObject = SolNil.instance;
            for (let i = 1; i <= n; i++) {
              result = this.sendMessage(args[0] as SolObject, "value:", [new SolInteger(i)], null);
            }
            return result;
          },
        ],
        ["isNumber", () => SolTrue.instance],
      ]),
    });

    // ─ String ─
    this.classRegistry.set("String", {
      name: "String",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        [
          "print",
          (recv) => {
            process.stdout.write((recv as SolString).value);
            return recv;
          },
        ],
        [
          "equalTo:",
          (recv, args) =>
            args[0] instanceof SolString && (recv as SolString).value === args[0].value
              ? SolTrue.instance
              : SolFalse.instance,
        ],
        ["asString", (recv) => recv],
        ["asInteger", (recv) => (recv as SolString).asInteger()],
        [
          "concatenateWith:",
          (recv, args) => {
            if (!(args[0] instanceof SolString)) return SolNil.instance;
            return new SolString((recv as SolString).value + args[0].value);
          },
        ],
        [
          "startsWith:endsBefore:",
          (recv, args) =>
            (recv as SolString).substring(
              (args[0] as SolInteger).value,
              (args[1] as SolInteger).value
            ),
        ],
        ["length", (recv) => new SolInteger((recv as SolString).value.length)],
        ["isString", () => SolTrue.instance],
      ]),
    });

    // ─ Nil ─
    this.classRegistry.set("Nil", {
      name: "Nil",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        ["asString", () => new SolString("nil")],
        ["isNil", () => SolTrue.instance],
      ]),
    });

    // ─ True ─
    this.classRegistry.set("True", {
      name: "True",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        ["asString", () => new SolString("true")],
        ["not", () => SolFalse.instance],
        ["and:", (_recv, args) => this.sendMessage(args[0] as SolObject, "value", [], null)],
        ["or:", () => SolTrue.instance],
        [
          "ifTrue:ifFalse:",
          (_recv, args) => this.sendMessage(args[0] as SolObject, "value", [], null),
        ],
        ["isBoolean", () => SolTrue.instance],
      ]),
    });

    // ─ False ─
    this.classRegistry.set("False", {
      name: "False",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        ["asString", () => new SolString("false")],
        ["not", () => SolTrue.instance],
        ["and:", () => SolFalse.instance],
        ["or:", (_recv, args) => this.sendMessage(args[0] as SolObject, "value", [], null)],
        [
          "ifTrue:ifFalse:",
          (_recv, args) => this.sendMessage(args[1] as SolObject, "value", [], null),
        ],
        ["isBoolean", () => SolTrue.instance],
      ]),
    });

    // ─ Block ─
    this.classRegistry.set("Block", {
      name: "Block",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: new Map<string, BuiltinMethod>([
        [
          "whileTrue:",
          (recv, args) => {
            const condBlock = recv as SolBlock;
            let result: SolObject = SolNil.instance;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            while (true) {
              const cond = this.invokeBlock(condBlock, []);
              if (cond !== SolTrue.instance) break;
              result = this.sendMessage(args[0] as SolObject, "value", [], null);
            }
            return result;
          },
        ],
      ]),
    });
  }

  private registerUserClasses(): void {
    if (!this.currentProgram) return;

    // First pass: register all classes
    for (const classDef of this.currentProgram.classes) {
      const builtinNames = ["Object", "Integer", "String", "Nil", "True", "False", "Block"];
      if (builtinNames.includes(classDef.name)) {
        throw new InterpreterError(
          ErrorCode.SEM_ERROR,
          `Cannot redefine built-in class: ${classDef.name}`
        );
      }
      if (this.classRegistry.has(classDef.name)) {
        throw new InterpreterError(
          ErrorCode.SEM_ERROR,
          `Duplicate class definition: ${classDef.name}`
        );
      }

      const userMethods = new Map<string, Block>();
      for (const method of classDef.methods) {
        if (method.block.arity !== this.selectorArity(method.selector)) {
          throw new InterpreterError(
            ErrorCode.SEM_ARITY,
            `Arity mismatch for method ${method.selector} in ${classDef.name}`
          );
        }
        userMethods.set(method.selector, method.block);
      }

      this.classRegistry.set(classDef.name, {
        name: classDef.name,
        parentName: classDef.parent,
        userMethods,
        builtinMethods: new Map(),
      });
    }

    // Second pass: validate parent classes exist
    for (const classDef of this.currentProgram.classes) {
      if (!this.classRegistry.has(classDef.parent)) {
        throw new InterpreterError(
          ErrorCode.SEM_UNDEF,
          `Undefined parent class: ${classDef.parent}`
        );
      }
    }
  }

  private selectorArity(selector: string): number {
    return (selector.match(/:/g) ?? []).length;
  }

  // ── Method lookup ────────────────────────────────────────────────────────

  private lookupMethod(className: string, selector: string): MethodLookupResult {
    let current: string | null = className;
    while (current !== null) {
      const cls = this.classRegistry.get(current);
      if (!cls) return null;

      const userMethod = cls.userMethods.get(selector);
      if (userMethod) return { type: "user", block: userMethod, definingClass: current };

      const builtinMethod = cls.builtinMethods.get(selector);
      if (builtinMethod) return { type: "builtin", fn: builtinMethod, definingClass: current };

      current = cls.parentName;
    }
    return null;
  }

  // ── Message dispatch ─────────────────────────────────────────────────────

  private sendMessage(
    receiver: SolObject,
    selector: string,
    args: SolObject[],
    superFromClass: string | null
  ): SolObject {
    // Determine where to start looking
    let lookupClass: string;
    if (superFromClass) {
      const cls = this.classRegistry.get(superFromClass);
      lookupClass = cls?.parentName ?? receiver.solClassName;
    } else {
      lookupClass = receiver.solClassName;
    }

    // Block value/value:/value:value: — handled dynamically based on arity
    if (receiver instanceof SolBlock) {
      const expectedSelector = valueSelectorForArity(receiver.arity);
      if (selector === expectedSelector) {
        return this.invokeBlock(receiver, args);
      }
    }

    // Look for method (user-defined or built-in) in class hierarchy
    const method = this.lookupMethod(lookupClass, selector);
    if (method) {
      if (method.type === "user") {
        return this.executeUserMethod(receiver, method.block, args, method.definingClass);
      }
      return method.fn(receiver, args);
    }

    // Instance attribute read (0 args)
    const readResult = this.tryReadInstanceAttribute(receiver, selector, args);
    if (readResult !== null) return readResult;

    // Instance attribute write (1 arg, selector ends with ':')
    const writeResult = this.tryWriteInstanceAttribute(receiver, selector, args, superFromClass);
    if (writeResult !== null) return writeResult;

    throw new InterpreterError(
      ErrorCode.INT_DNU,
      `${receiver.solClassName} does not understand '${selector}'`
    );
  }

  private tryReadInstanceAttribute(
    receiver: SolObject,
    selector: string,
    args: SolObject[]
  ): SolObject | null {
    if (args.length === 0) {
      const attrVal = receiver.instanceAttributes.get(selector);
      if (attrVal !== undefined) return attrVal;
    }
    return null;
  }

  private tryWriteInstanceAttribute(
    receiver: SolObject,
    selector: string,
    args: SolObject[],
    superFromClass: string | null
  ): SolObject | null {
    if (args.length === 1 && selector.endsWith(":")) {
      const attrName = selector.slice(0, -1);

      // Collision check — can't create attribute if a zero-arg method exists
      const collisionClass = superFromClass
        ? (this.classRegistry.get(superFromClass)?.parentName ?? receiver.solClassName)
        : receiver.solClassName;
      if (this.lookupMethod(collisionClass, attrName)) {
        throw new InterpreterError(
          ErrorCode.INT_INST_ATTR,
          `Attribute '${attrName}' collides with a method`
        );
      }

      receiver.instanceAttributes.set(attrName, args[0] as SolObject);
      return receiver; // setting an attribute returns self
    }
    return null;
  }

  // ── Block / method execution ─────────────────────────────────────────────

  private executeUserMethod(
    receiver: SolObject,
    block: Block,
    args: SolObject[],
    definingClass: string
  ): SolObject {
    const env = new Environment(null);

    for (let i = 0; i < block.parameters.length; i++) {
      const param = block.parameters[i];
      const name = param?.name || `arg${String(i + 1)}`;
      env.defineParameter(name, args[i] as SolObject);
    }

    return this.executeStatements(block.assigns, env, receiver, definingClass);
  }

  private invokeBlock(block: SolBlock, args: SolObject[]): SolObject {
    const env = new Environment(block.closureEnv);

    for (let i = 0; i < block.blockNode.parameters.length; i++) {
      const param = block.blockNode.parameters[i];
      const name = param?.name || `arg${String(i + 1)}`;
      env.defineParameter(name, args[i] as SolObject);
    }

    return this.executeStatements(
      block.blockNode.assigns,
      env,
      block.selfRef,
      block.definingClassName
    );
  }

  private executeStatements(
    assigns: Assign[],
    env: Environment,
    selfRef: SolObject | null,
    definingClassName: string | null
  ): SolObject {
    let result: SolObject = SolNil.instance;

    for (const assign of assigns) {
      const value = this.evaluateExpr(assign.expr, env, selfRef, definingClassName);
      const targetName = assign.target.name;

      // Cannot assign to formal parameters
      if (env.isParameter(targetName)) {
        throw new InterpreterError(
          ErrorCode.SEM_COLLISION,
          `Cannot assign to formal parameter '${targetName}'`
        );
      }

      env.set(targetName, value);
      result = value;
    }

    return result;
  }

  // ── Expression evaluation ────────────────────────────────────────────────

  private evaluateExpr(
    expr: Expr,
    env: Environment,
    selfRef: SolObject | null,
    definingClassName: string | null
  ): SolObject {
    if (expr.literal) return this.evaluateLiteral(expr.literal);
    if (expr.var) return this.evaluateVar(expr.var, env, selfRef);
    if (expr.block) return this.evaluateBlockLiteral(expr.block, env, selfRef, definingClassName);
    if (expr.send) return this.evaluateSend(expr.send, env, selfRef, definingClassName);
    throw new InterpreterError(ErrorCode.GENERAL_OTHER, "Invalid expression node");
  }

  private evaluateLiteral(literal: Literal): SolObject {
    switch (literal.class_id) {
      case "Integer":
        return new SolInteger(Number(literal.value));
      case "String":
        return new SolString(literal.value);
      case "True":
        return SolTrue.instance;
      case "False":
        return SolFalse.instance;
      case "Nil":
        return SolNil.instance;
      case "class":
        // Class literals are only valid as receivers — handled in evaluateSend.
        // If we reach here, the class id was used standalone (not possible in valid SOL26).
        throw new InterpreterError(
          ErrorCode.SEM_UNDEF,
          `Class literal '${literal.value}' used as a value`
        );
      default:
        throw new InterpreterError(
          ErrorCode.INT_STRUCTURE,
          `Unknown literal class: ${literal.class_id}`
        );
    }
  }

  private evaluateVar(varNode: Var, env: Environment, selfRef: SolObject | null): SolObject {
    switch (varNode.name) {
      case "self":
      case "super":
        if (!selfRef)
          throw new InterpreterError(ErrorCode.SEM_UNDEF, "self/super used outside of a method");
        return selfRef;
      case "nil":
        return SolNil.instance;
      case "true":
        return SolTrue.instance;
      case "false":
        return SolFalse.instance;
      default: {
        const val = env.get(varNode.name);
        if (val === undefined) {
          throw new InterpreterError(ErrorCode.SEM_UNDEF, `Undefined variable: '${varNode.name}'`);
        }
        return val;
      }
    }
  }

  private evaluateBlockLiteral(
    block: Block,
    env: Environment,
    selfRef: SolObject | null,
    definingClassName: string | null
  ): SolBlock {
    return new SolBlock(block, env, selfRef, definingClassName);
  }

  private evaluateSend(
    send: import("./input_model.js").Send,
    env: Environment,
    selfRef: SolObject | null,
    definingClassName: string | null
  ): SolObject {
    // ── Class messages: receiver is a class literal ──
    if (send.receiver.literal?.class_id === "class") {
      const className = send.receiver.literal.value;
      const args = send.args.map((a) =>
        this.evaluateExpr(a.expr, env, selfRef, definingClassName)
      );
      return this.handleClassMessage(className, send.selector, args);
    }

    // ── Detect super send ──
    const isSuperSend = send.receiver.var?.name === "super";

    // Evaluate receiver, then arguments left-to-right
    const receiver = this.evaluateExpr(send.receiver, env, selfRef, definingClassName);
    const args = send.args.map((a) => this.evaluateExpr(a.expr, env, selfRef, definingClassName));

    const superFromClass = isSuperSend ? definingClassName : null;
    return this.sendMessage(receiver, send.selector, args, superFromClass);
  }

  // ── Class messages (new, from:, read) ────────────────────────────────────

  private handleClassMessage(className: string, selector: string, args: SolObject[]): SolObject {
    if (!this.classRegistry.has(className)) {
      throw new InterpreterError(ErrorCode.SEM_UNDEF, `Undefined class: '${className}'`);
    }

    switch (selector) {
      case "new":
        return this.createInstance(className);
      case "from:":
        return this.createInstanceFrom(className, args[0] as SolObject);
      case "read":
        if (className === "String") return SolString.read();
        throw new InterpreterError(
          ErrorCode.SEM_UNDEF,
          `Class '${className}' does not understand class message 'read'`
        );
      default:
        throw new InterpreterError(
          ErrorCode.SEM_UNDEF,
          `Unknown class message '${selector}' for '${className}'`
        );
    }
  }

  private createInstance(className: string): SolObject {
    // Singletons
    if (className === "Nil") return SolNil.instance;
    if (className === "True") return SolTrue.instance;
    if (className === "False") return SolFalse.instance;

    // Built-in with defaults
    if (className === "Integer") return new SolInteger(0);
    if (className === "String") return new SolString("");
    if (className === "Block") {
      const emptyBlock: Block = { arity: 0, parameters: [], assigns: [] };
      return new SolBlock(emptyBlock, new Environment(), null, null);
    }

    // User-defined class (or subclass of built-in inheriting from Object)
    const builtin = this.findBuiltinAncestor(className);
    if (builtin === "Integer") {
      const obj = new SolInteger(0);
      obj.solClassName = className;
      return obj;
    }
    if (builtin === "String") {
      const obj = new SolString("");
      obj.solClassName = className;
      return obj;
    }

    return new SolUserObject(className);
  }

  private createInstanceFrom(className: string, source: SolObject): SolObject {
    // Singletons
    if (className === "Nil") return SolNil.instance;
    if (className === "True") return SolTrue.instance;
    if (className === "False") return SolFalse.instance;

    const targetBuiltin = this.findBuiltinAncestor(className);
    this.validateSourceCompatibility(className, targetBuiltin, source);

    const newObj = this.createConvertedObject(className, targetBuiltin, source);

    // Shallow copy instance attributes
    for (const [key, val] of source.instanceAttributes) {
      newObj.instanceAttributes.set(key, val);
    }

    return newObj;
  }

  private validateSourceCompatibility(
    className: string,
    targetBuiltin: string | null,
    source: SolObject
  ): void {
    if (targetBuiltin === "Integer" && !(source instanceof SolInteger)) {
      throw new InterpreterError(
        ErrorCode.INT_INVALID_ARG,
        `from: for ${className} requires Integer-compatible source`
      );
    }
    if (targetBuiltin === "String" && !(source instanceof SolString)) {
      throw new InterpreterError(
        ErrorCode.INT_INVALID_ARG,
        `from: for ${className} requires String-compatible source`
      );
    }
  }

  private createConvertedObject(
    className: string,
    targetBuiltin: string | null,
    source: SolObject
  ): SolObject {
    if (
      source instanceof SolInteger &&
      (targetBuiltin === "Integer" || targetBuiltin === "Object")
    ) {
      const newObj = new SolInteger(source.value);
      newObj.solClassName = className;
      return newObj;
    }
    if (
      source instanceof SolString &&
      (targetBuiltin === "String" || targetBuiltin === "Object")
    ) {
      const newObj = new SolString(source.value);
      newObj.solClassName = className;
      return newObj;
    }
    return new SolUserObject(className);
  }

  private findBuiltinAncestor(className: string): string | null {
    const builtins = new Set(["Object", "Integer", "String", "Nil", "True", "False", "Block"]);
    let current: string | null = className;
    while (current !== null) {
      if (builtins.has(current)) return current;
      const cls = this.classRegistry.get(current);
      if (!cls) return null;
      current = cls.parentName;
    }
    return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function valueSelectorForArity(arity: number): string {
  if (arity === 0) return "value";
  return "value:".repeat(arity);
}
