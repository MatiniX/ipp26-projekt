import { Arg, Assign, Block, Method, Parameter } from "./input_model.js";

export interface StatementVisitor<R> {
  visitBlock(stmt: BlockStatement): R;
  visitClassDef(stmt: ClassDefStatement): R;
  visitMethod(stmt: MethodStatement): R;
  visitSend(stmt: SendStatement): R;
}

export abstract class Statement {
  abstract accept<R>(visitor: StatementVisitor<R>): R;
}

export class BlockStatement extends Statement {
  constructor(
    public arity: number,
    public parameters: Parameter[],
    public assigns: Assign[]
  ) {
    super();
  }
  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitBlock(this);
  }
}

export class ClassDefStatement extends Statement {
  constructor(
    public name: string,
    public parentName: string | null,
    public methods: Method[]
  ) {
    super();
  }
  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitClassDef(this);
  }
}

export class MethodStatement extends Statement {
  constructor(
    public selector: string,
    public block: Block
  ) {
    super();
  }
  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitMethod(this);
  }
}

export class SendStatement extends Statement {
  constructor(
    public receiver: string,
    public selector: string,
    public args: Arg[]
  ) {
    super();
  }
  accept<R>(visitor: StatementVisitor<R>): R {
    return visitor.visitSend(this);
  }
}
