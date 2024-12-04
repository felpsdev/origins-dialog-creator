import { Node, Position, XYPosition } from "@xyflow/react";

export interface Document {
  npc?: string;
  location?: { x: number; y: number; z: number };
  actions: Action[];
  results: Result[];
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
  initial: boolean;
  message: string;
  preferred: string;
  actions: string[];
  close: {
    enabled: boolean;
    delay: number;
  };
  node: {
    position: XYPosition;
    handle: ResultNode["data"]["handle"];
  };
}

export interface ResultNode extends Node {
  data: {
    initial: boolean;
    message: string;
    preferred: string;
    order: string[];
    close: {
      enabled: boolean;
      delay: number;
    };
    handle: {
      trigger: Position.Left | Position.Right;
      actions: Position.Left | Position.Right;
    };
  };
}

export interface ActionNode extends Node {
  data: {
    label: string;
    handle: {
      owner: Position.Left | Position.Right;
      result: Position.Left | Position.Right;
    };
  };
}

export type RenderNode = ResultNode | ActionNode;

export type NodeType = "result" | "action";
