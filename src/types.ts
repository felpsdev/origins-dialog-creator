import { Node, Position, XYPosition } from "@xyflow/react";
import { Settings } from "./store";

export interface Document {
  npc: string;
  interaction?: Settings["interaction"];
  actions: Action[];
  results: Result[];
  conditions: Condition[];
  initial: {
    id: string;
    type: "result" | "condition";
  };
}

export interface Action {
  id: string;
  label: string;
  target: string;
  node: {
    position: XYPosition;
    handle: ActionNode["data"]["handle"];
  };
}

export interface Result {
  id: string;
  message: string;
  preferred: string;
  actions: string[];
  close: {
    enabled: boolean;
    delay: number;
  };
  executor: ResultExecutor<ResultExecutorType>[];
  node: {
    position: XYPosition;
    handle: ResultNode["data"]["handle"];
  };
}

export interface Condition {
  id: string;
  value: string;
  condition: ConditionType;
  objective: string | number | boolean;
  target: {
    true?: string;
    false?: string;
  };
  node: {
    position: XYPosition;
    handle: ConditionalNode["data"]["handle"];
  };
}

/* Flow */

export type FlowNode = ResultNode | ActionNode | ConditionalNode | Node;

export type FlowNodeType = keyof FlowNodeTypeRelation;

export interface FlowNodeTypeRelation {
  result: ResultNode;
  action: ActionNode;
  conditional: ConditionalNode;
}

/* Result Node */

export type ResultExecutorType = keyof ResultExecutorValueRelation;

export interface ResultExecutorValueRelation {
  command: string;
  dialog_store: { key: string; value: string | number | boolean | null };
  set_coins: number | string;
  set_gems: number | string;
  open_market: string;
}

export interface ResultExecutor<T extends ResultExecutorType> {
  type: T;
  value: ResultExecutorValueRelation[T];
}

export interface ResultNode extends Node {
  data: {
    message: string;
    preferred: string;
    order: string[];
    close: {
      enabled: boolean;
      delay: number;
    };
    executor: ResultExecutor<ResultExecutorType>[];
    handle: {
      trigger: Position.Left | Position.Right;
      actions: Position.Left | Position.Right;
    };
  };
}

/* Action Node */

export interface ActionNode extends Node {
  data: {
    label: string;
    handle: {
      owner: Position.Left | Position.Right;
      result: Position.Left | Position.Right;
    };
  };
}

/* Conditional Node */

export type ConditionType =
  | "equal"
  | "not_equal"
  | "greater_than"
  | "greater_than_or_equal"
  | "less_than"
  | "less_than_or_equal";

export interface ConditionalNode extends Node {
  data: {
    value: string;
    condition: ConditionType;
    objective: string | number | boolean;
    handle: {
      trigger: Position.Left | Position.Right;
      true: Position.Left | Position.Right;
      false: Position.Left | Position.Right;
    };
  };
}
