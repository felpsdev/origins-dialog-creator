import { Edge, Position, XYPosition } from "@xyflow/react";
import {
  Action,
  ActionNode,
  Document,
  NodeType,
  RenderNode,
  Result,
  ResultNode,
} from "../types";

class Render {
  private nodes: RenderNode[] = [];
  private edges: Edge[] = [];

  constructor(nodes: RenderNode[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  public generate() {
    const actions = this.resolveActions();
    const results = this.resolveResults();

    return { actions, results };
  }

  /* Results */

  private resolveResultActions(resultId: string) {
    const connections = this.edges.filter(
      (ed) => ed.source === resultId && ed.sourceHandle === "result_actions"
    );
    return connections.map((ed) => ed.target);
  }

  private resolveResults(): Result[] {
    return this.nodes
      .filter((nd) => nd.type === "result")
      .map((nd) => {
        const actions = this.resolveResultActions(nd.id);
        const {
          initial = false,
          message,
          preferred,
          order,
          close,
          handle,
        } = nd.data as ResultNode["data"];

        const ordered = [
          preferred,
          ...actions
            .filter((ac) => ac !== preferred)
            .sort((a, b) => order.indexOf(a) - order.indexOf(b)),
        ];

        return {
          id: nd.id,
          initial,
          message,
          preferred,
          actions: ordered,
          close,
          node: { position: nd.position, handle },
        };
      });
  }

  /* Actions */

  private resolveActionTarget(actionId: string) {
    const connection = this.edges.find(
      (ed) => ed.source === actionId && ed.sourceHandle === "action_result"
    );
    return connection?.target;
  }

  private resolveActions(): Action[] {
    return this.nodes
      .filter((nd) => nd.type === "action")
      .map((nd) => {
        const { label, handle } = nd.data as ActionNode["data"];
        const target = this.resolveActionTarget(nd.id);
        if (!target) return;

        return {
          id: nd.id,
          label,
          target,
          node: { position: nd.position, handle },
        };
      })
      .filter((p) => p !== undefined);
  }
}

/* Parsing */

function parseFlow(data: Document) {
  const nodes = [] as RenderNode[];
  const edges = [] as Edge[];

  data.results.map((res) => {
    const { initial, id, message, preferred, actions, close, node } = res;

    nodes.push({
      id,
      type: "result",
      position: node.position,
      origin: [0.5, 0.5],
      draggable: !initial,
      data: {
        initial,
        message,
        preferred,
        order: actions.filter((r) => r !== preferred),
        close,
        handle: node.handle,
      },
    });

    actions.map((ac) => {
      edges.push({
        id: `${id}-${ac}`,
        source: id,
        type: "step",
        sourceHandle: "result_actions",
        target: ac,
        targetHandle: "action_owner",
      });
    });
  });

  data.actions.map((act) => {
    const { id, label, target, node } = act;

    nodes.push({
      id,
      type: "action",
      position: node.position,
      origin: [0.5, 0.5],
      data: {
        label: label,
        handle: node.handle,
      },
    });

    edges.push({
      id: `${id}-${target}`,
      type: "step",
      animated: true,
      source: id,
      sourceHandle: "action_result",
      target: target,
      targetHandle: "result_trigger",
    });
  });

  return { nodes, edges };
}

/* Rendering */

function renderFlow(nodes: RenderNode[], edges: Edge[]) {
  return new Render(nodes, edges).generate();
}

/* Create */

function createNode<T extends NodeType>(
  type: T,
  position: XYPosition,
  id?: string
): T extends "result" ? ResultNode : ActionNode {
  let defaultData = {};

  switch (type) {
    case "action":
      defaultData = {
        label: "",
        handle: {
          owner: Position.Left,
          result: Position.Right,
        },
      } as ActionNode["data"];
      break;

    case "result":
      defaultData = {
        initial: false,
        message: "",
        preferred: "",
        order: [],
        close: { enabled: false, delay: 1000 },
        handle: {
          trigger: Position.Left,
          actions: Position.Right,
        },
      } as ResultNode["data"];
  }

  return {
    id: id || crypto.randomUUID(),
    type,
    position,
    origin: [0.5, 0.5],
    data: defaultData,
  } as T extends "result" ? ResultNode : ActionNode;
}

export default { renderFlow, parseFlow, createNode };
