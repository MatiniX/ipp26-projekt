import { Block, Expr, Literal, Send, Var } from "./input_model.js";

export interface ExpressionVisitor<R> {
  visitExpr(expr: SolExpresion): R;
  visitAssign(expr: AssignExpression): R;
}

export abstract class Expression {
  abstract accept<R>(visitor: ExpressionVisitor<R>): R;
}

export class SolExpresion extends Expression {
  constructor(
    public literal: Literal | null,
    public variable: Var | null,
    public block: Block | null,
    public send: Send | null
  ) {
    super();
  }

  accept<R>(visitor: ExpressionVisitor<R>): R {
    return visitor.visitExpr(this);
  }
}

export class AssignExpression extends Expression {
  constructor(
    public target: Var,
    public expr: Expr
  ) {
    super();
  }

  accept<R>(visitor: ExpressionVisitor<R>): R {
    return visitor.visitAssign(this);
  }
}
