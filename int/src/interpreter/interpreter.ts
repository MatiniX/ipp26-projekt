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
  Send,
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
import { MethodLookupResult } from "./types.js";
import { ExecutionContext, RuntimeClass } from "./interfaces.js";
import {
  BlockStatement,
  ClassDefStatement,
  MethodStatement,
  SendStatement,
  Statement,
  StatementVisitor,
} from "./statement.js";
import { AssignExpression, Expression, ExpressionVisitor, SolExpresion } from "./expression.js";

const logger = getLogger("interpreter");
export class Interpreter implements StatementVisitor<void>, ExpressionVisitor<SolObject> {
  public currentProgram: Program | null = null;
  private classRegistry = new Map<string, RuntimeClass>();
  private builtinClassNames: string[] = [];
  private currentParsingClass: { name: string; userMethods: Map<string, Block> } | null = null;
  private contextStack: ExecutionContext[] = [];

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

  /**
   * Main entry point for executing the loaded program.
   * @param inputIo User input stream (for String read).
   */
  public execute(inputIo: Readable): void {
    logger.info("Executing program");

    SolString.setInputStream(inputIo);

    if (!this.currentProgram) {
      throw new InterpreterError(ErrorCode.GENERAL_INPUT, "No program loaded");
    }

    //Double-pass class registration: first register class names and methods to allow for mutual recursion, then check parent existence and Main/run.
    this.registerBuiltinClasses();
    for (const cls of this.currentProgram.classes) {
      this.visitClassDef(new ClassDefStatement(cls.name, cls.parent, cls.methods));
    }

    for (const cls of this.currentProgram.classes) {
      if (!this.classRegistry.has(cls.parent)) {
        throw new InterpreterError(ErrorCode.SEM_UNDEF, `Undefined parent class: ${cls.parent}`);
      }
    }

    if (!this.lookupMethod("Main", "run")) {
      throw new InterpreterError(ErrorCode.SEM_MAIN, "Missing Main class or its run method");
    }

    //Execute the program by sending 'run' to an instance of Main.
    this.executeStatement(new SendStatement("Main", "run", []));
  }

  visitExpr(expr: SolExpresion): SolObject {
    if (!this.currentContext) {
      throw new InterpreterError(ErrorCode.GENERAL_OTHER, "No execution context available");
    }
    const { env, selfRef, definingClassName } = this.currentContext;

    if (expr.literal) return this.evaluateLiteral(expr.literal);
    if (expr.variable) return this.evaluateVar(expr.variable, env, selfRef);
    if (expr.block) return this.evaluateBlockLiteral(expr.block, env, selfRef, definingClassName);
    if (expr.send) return this.evaluateSend(expr.send, env, selfRef, definingClassName);

    throw new InterpreterError(ErrorCode.GENERAL_OTHER, "Invalid expression node");
  }

  visitAssign(expr: AssignExpression): SolObject {
    if (!this.currentContext) {
      throw new InterpreterError(ErrorCode.GENERAL_OTHER, "No execution context available");
    }
    const { env } = this.currentContext;

    const solExpr = new SolExpresion(
      expr.expr.literal,
      expr.expr.var,
      expr.expr.block,
      expr.expr.send
    );
    const value = this.evaluateExpression(solExpr);

    const targetName = expr.target.name;

    if (env.isParameter(targetName)) {
      throw new InterpreterError(
        ErrorCode.SEM_COLLISION,
        `Cannot assign to formal parameter '${targetName}'`
      );
    }

    env.set(targetName, value);
    return value;
  }

  visitBlock(stmt: BlockStatement): void {
    if (!this.currentContext) {
      throw new InterpreterError(ErrorCode.GENERAL_OTHER, "No execution context available");
    }
    this.currentContext.lastBlockResult = SolNil.instance;

    for (const assign of stmt.assigns) {
      const assignExpr = new AssignExpression(assign.target, assign.expr);
      const value = this.evaluateExpression(assignExpr);
      //Keep track of the last evaluated expression in the block
      this.currentContext.lastBlockResult = value;
    }
  }

  visitClassDef(stmt: ClassDefStatement): void {
    if (this.builtinClassNames.includes(stmt.name)) {
      throw new InterpreterError(
        ErrorCode.SEM_ERROR,
        `Cannot redefine built-in class: ${stmt.name}`
      );
    }

    if (this.classRegistry.has(stmt.name)) {
      throw new InterpreterError(ErrorCode.SEM_ERROR, `Duplicate class definition: ${stmt.name}`);
    }

    this.currentParsingClass = {
      name: stmt.name,
      userMethods: new Map<string, Block>(),
    };
    for (const method of stmt.methods) {
      this.executeStatement(new MethodStatement(method.selector, method.block));
    }

    this.classRegistry.set(stmt.name, {
      name: stmt.name,
      parentName: stmt.parentName,
      userMethods: this.currentParsingClass.userMethods,
      builtinMethods: new Map(),
    });
  }

  visitMethod(stmt: MethodStatement): void {
    if (!this.currentParsingClass) {
      throw new InterpreterError(ErrorCode.GENERAL_OTHER, "Method defined outside of a class.");
    }

    if (stmt.block.arity !== this.selectorArity(stmt.selector)) {
      throw new InterpreterError(
        ErrorCode.SEM_ARITY,
        `Arity mismatch for method ${stmt.selector}`
      );
    }

    this.currentParsingClass.userMethods.set(stmt.selector, stmt.block);
  }

  visitSend(stmt: SendStatement): void {
    const receiverInst = new SolUserObject(stmt.receiver);

    const evaluatedArgs: SolObject[] = stmt.args.map((a) => {
      const solExpr = new SolExpresion(a.expr.literal, a.expr.var, a.expr.block, a.expr.send);
      return this.evaluateExpression(solExpr);
    });

    this.sendMessage(receiverInst, stmt.selector, evaluatedArgs, null);
  }

  private get currentContext() {
    if (this.contextStack.length === 0) {
      throw new InterpreterError(ErrorCode.GENERAL_OTHER, "No execution context available");
    }
    return this.contextStack[this.contextStack.length - 1];
  }

  private executeStatement(stmt: Statement) {
    stmt.accept(this);
  }

  private evaluateExpression(expression: Expression): SolObject {
    return expression.accept(this);
  }

  // ── Class registration ───────────────────────────────────────────────────

  private registerBuiltinClasses(): void {
    this.classRegistry.set("Object", {
      name: "Object",
      parentName: null,
      userMethods: new Map(),
      builtinMethods: SolObject.getbuiltinMethods(),
    });
    this.builtinClassNames.push("Object");

    this.classRegistry.set("Integer", {
      name: "Integer",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: SolInteger.getBuiltinMethods(),
    });
    this.builtinClassNames.push("Integer");

    this.classRegistry.set("String", {
      name: "String",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: SolString.getBuiltinMethods(),
    });
    this.builtinClassNames.push("String");

    this.classRegistry.set("Nil", {
      name: "Nil",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: SolNil.getBuiltinMethods(),
    });
    this.builtinClassNames.push("Nil");

    this.classRegistry.set("True", {
      name: "True",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: SolTrue.getBuiltinMethods(),
    });
    this.builtinClassNames.push("True");

    this.classRegistry.set("False", {
      name: "False",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: SolFalse.getBuiltinMethods(),
    });
    this.builtinClassNames.push("False");

    this.classRegistry.set("Block", {
      name: "Block",
      parentName: "Object",
      userMethods: new Map(),
      builtinMethods: SolBlock.getBuiltinMethods(),
    });
    this.builtinClassNames.push("Block");
  }

  /**
   * Determines the arity of a method selector based on the number of colons it contains.
   * @param selector Selector string of the method (e.g., "value:value:").
   * @returns The arity of the selector string.
   */
  private selectorArity(selector: string): number {
    return (selector.match(/:/g) ?? []).length;
  }

  /**
   * Looks up a method in the class hierarchy.
   * @param className Name of the class to start lookup from.
   * @param selector Selector of the method to look up.
   * @returns Information about the found method, or null if not found.
   */
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

  /**
   * Sends a message to the appropriate method or attribute of the receiver.
   * @param receiver The object receiving the message.
   * @param selector The method or attribute name.
   * @param args The arguments for the method call.
   * @param superFromClass The class from which to start the lookup.
   * @returns The result of the method call or attribute access.
   */
  public sendMessage(
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
      return method.fn(receiver, args, this);
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

  /**
   * Tries to read an instance attribute from the receiver.
   * @param receiver The object from which to read the attribute.
   * @param selector The attribute name.
   * @param args The arguments for the operation. Should be empty for attribute read.
   * @returns The value of the attribute, or null if not found.
   */
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

  /**
   * Tries to write an instance attribute to the receiver.
   * @param receiver The object to which to write the attribute.
   * @param selector The attribute name.
   * @param args The arguments for the operation. Should contain exactly one element for attribute write.
   * @param superFromClass The class from which to start the lookup.
   * @returns The receiver, or null if the operation failed.
   */
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

  /**
   * Executes a user-defined method.
   * @param receiver The object on which the method is called.
   * @param block The method block to execute.
   * @param args The arguments for the method call.
   * @param definingClass Name of the class where the method is defined.
   * @returns The result of the method execution.
   */
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

    //Setup execution context for the method call, with selfRef pointing to the receiver and definingClassName for super sends.
    this.contextStack.push({
      env: env,
      selfRef: receiver,
      definingClassName: definingClass,
      lastBlockResult: null,
    });

    try {
      const blockStmt = new BlockStatement(block.arity, block.parameters, block.assigns);
      this.executeStatement(blockStmt);

      //Method result is the value of the last expression in the block, or nil if block is empty.
      return this.currentContext?.lastBlockResult || SolNil.instance;
    } finally {
      //Pop the execution context to restore the caller's environment and selfRef after method execution completes.
      this.contextStack.pop();
    }
  }

  /**
   * Invokes a block with the given arguments.
   * @param block The block to invoke.
   * @param args The arguments for the block call.
   * @returns The result of the block execution.
   */
  public invokeBlock(block: SolBlock, args: SolObject[]): SolObject {
    const env = new Environment(block.closureEnv);

    for (let i = 0; i < block.blockNode.parameters.length; i++) {
      const param = block.blockNode.parameters[i];
      const name = param?.name || `arg${String(i + 1)}`;
      env.defineParameter(name, args[i] as SolObject);
    }

    this.contextStack.push({
      env: env,
      selfRef: block.selfRef,
      definingClassName: block.definingClassName,
      lastBlockResult: null,
    });

    try {
      const blockStmt = new BlockStatement(
        block.blockNode.arity,
        block.blockNode.parameters,
        block.blockNode.assigns
      );
      this.executeStatement(blockStmt);

      return this.currentContext?.lastBlockResult || SolNil.instance;
    } finally {
      this.contextStack.pop();
    }
  }

  /**
   * Evaluates an expression in the given environment.
   * @param expr The expression to evaluate.
   * @param env The environment in which to evaluate the expression.
   * @param selfRef The self reference for the evaluation context.
   * @param definingClassName The class name where the evaluation is defined.
   * @returns The result of the expression evaluation.
   */
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

  /**
   * Evaluates a literal expression and returns the corresponding SolObject instance.
   * @param literal The literal expression to evaluate.
   * @returns The corresponding SolObject instance.
   */
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

  /**
   * Evaluates a variable expression and returns the corresponding SolObject instance.
   * @param varNode The variable expression to evaluate.
   * @param env The environment in which to evaluate the expression.
   * @param selfRef The self reference for the evaluation context.
   * @returns The corresponding SolObject instance.
   */
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
        if (val instanceof ErrorCode) {
          throw new InterpreterError(val, `Undefined variable: '${varNode.name}'`);
        }
        return val;
      }
    }
  }

  /**
   * Evaluates a block literal expression and returns the corresponding SolBlock instance.
   * @param block The block literal expression to evaluate.
   * @param env The environment in which to evaluate the expression.
   * @param selfRef The self reference for the evaluation context.
   * @param definingClassName The class name where the evaluation is defined.
   * @returns The corresponding SolBlock instance.
   */
  private evaluateBlockLiteral(
    block: Block,
    env: Environment,
    selfRef: SolObject | null,
    definingClassName: string | null
  ): SolBlock {
    return new SolBlock(block, env, selfRef, definingClassName);
  }

  /**
   * Evaluates a send statement and returns the corresponding SolObject instance.
   * @param send The send statement to evaluate.
   * @param env The environment in which to evaluate the statement.
   * @param selfRef The self reference for the evaluation context.
   * @param definingClassName The class name where the evaluation is defined.
   * @returns The corresponding SolObject instance.
   */
  private evaluateSend(
    send: Send,
    env: Environment,
    selfRef: SolObject | null,
    definingClassName: string | null
  ): SolObject {
    //Class messages: receiver is a class literal (e.g., Integer new, String from:)
    if (send.receiver.literal?.class_id === "class") {
      const className = send.receiver.literal.value;
      const args = send.args.map((a) =>
        this.evaluateExpr(a.expr, env, selfRef, definingClassName)
      );
      return this.handleClassMessage(className, send.selector, args);
    }

    const isSuperSend = send.receiver.var?.name === "super";

    //Evaluate receiver, then arguments left-to-right
    const receiver = this.evaluateExpr(send.receiver, env, selfRef, definingClassName);
    const args = send.args.map((a) => this.evaluateExpr(a.expr, env, selfRef, definingClassName));

    const superFromClass = isSuperSend ? definingClassName : null;
    return this.sendMessage(receiver, send.selector, args, superFromClass);
  }

  /**
   * Handles class messages (new, from:, read)
   * @param className The name of the class receiving the message.
   * @param selector The message selector should be one of "new", "from:", or "read".
   * @param args The arguments for the class message. Only "from:" takes one argument (the source object).
   * @returns Instance of the class for "new" and "from:", or the result of reading for "read".
   */
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

  /**
   * Creates an instance of the specified class.
   * @param className The name of the class for which to create an instance.
   * @returns The created instance.
   */
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

  /**
   * Creates an instance of the specified class from a source object.
   * @param className The name of the class for which to create an instance.
   * @param source The source object from which to initialize the new instance.
   * @returns The created instance.
   */
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

  /**
   * Validates the compatibility of the source object with the target class.
   * @param className The name of the class for which to create an instance.
   * @param targetBuiltin The builtin class to which the source object should be compatible.
   * @param source The source object from which to initialize the new instance.
   */
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

  /**
   * Creates a new object of the specified class by converting the source object if necessary.
   * @param className The name of the class for which to create an instance.
   * @param targetBuiltin The builtin class to which the source object should be compatible.
   * @param source The source object from which to initialize the new instance.
   * @returns The created instance.
   */
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

  /**
   * Try to find the nearest built-in ancestor of the given class in the class hierarchy.
   * @param className The name of the class for which to find an ancestor.
   * @returns The name of the nearest built-in ancestor, or null if none is found.
   */
  private findBuiltinAncestor(className: string): string | null {
    let current: string | null = className;
    while (current !== null) {
      if (this.builtinClassNames.includes(current)) return current;
      const cls = this.classRegistry.get(current);
      if (!cls) return null;
      current = cls.parentName;
    }
    return null;
  }

  /**
   * Gets the singleton instance of the Nil class.
   * @returns The singleton instance of the Nil class.
   */
  public getNil(): SolObject {
    return SolNil.instance;
  }

  /**
   * Gets the singleton instance of the True class.
   * @returns The singleton instance of the True class.
   */
  public getTrue(): SolObject {
    return SolTrue.instance;
  }
  /**
   * Gets the singleton instance of the False class.
   * @returns The singleton instance of the False class.
   */
  public getFalse(): SolObject {
    return SolFalse.instance;
  }
  /**
   * Creates a new string object.
   * @param val The value for the new string object.
   * @returns The created string object.
   */
  public createString(val: string): SolObject {
    return new SolString(val);
  }
}

/**
 * Selects the appropriate value property based on the number of arguments.
 * @param arity The number of arguments.
 * @returns The selected value property.
 */
function valueSelectorForArity(arity: number): string {
  if (arity === 0) return "value";
  return "value:".repeat(arity);
}
