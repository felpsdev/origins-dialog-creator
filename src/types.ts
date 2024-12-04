import { Edge, Node, Position, XYPosition } from "@xyflow/react";

export interface DocumentNode {
  id: string;
  type: Position.Left | Position.Right;
  position: XYPosition;
  data: any;
}

export interface Document {
  npc?: string;
  location?: { x: number; y: number; z: number };
  message: string;
  actions: Action[];
  result: Result[];
  creator_data: {
    nodes: DocumentNode[];
    edges: Edge[];
  };
}

export interface Response {
  message?: string;
  actions?: Action[];
  result?: Result[];
  shouldClose?: boolean;
  closeWhen?: string;
  closeTimeout?: number;
}

export interface Action {
  key: string;
  label: string;
  preferred: boolean;
}

export interface Result {
  for: string | string[];
  response: Response;
}

export interface ResultNode extends Node {
  data: {
    message: string;
    preferredId: string;
    actionsOrder: string[];
    closeOnFinish?: boolean;
    closeDelay?: number;
    initial: boolean;
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
