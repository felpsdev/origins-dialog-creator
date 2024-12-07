import { Edge, Position, XYPosition } from "@xyflow/react";
import {
  Action,
  ActionNode,
  Condition,
  ConditionalNode,
  Document,
  FlowNode,
  FlowNodeType,
  FlowNodeTypeRelation,
  Result,
  ResultNode,
} from "../types";

class Render {
  private nodes: FlowNode[] = [];
  private edges: Edge[] = [];

  constructor(nodes: FlowNode[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  public generate() {
    const initial = this.resolveInitial();
    if (!initial) return null;

    const actions = this.resolveActions();
    const results = this.resolveResults();
    const conditions = this.resolveConditions();

    return { initial, actions, results, conditions };
  }

  /* Intial */

  private resolveInitial() {
    const connection = this.edges.find(
      (ed) => ed.source === "INITIAL" && ed.sourceHandle === "initial_target"
    );
    if (!connection?.target) return false;

    const target = this.nodes.find((nd) => nd.id === connection?.target);
    if (!target) return false;

    return { id: target.id, type: target.type };
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
        const { message, preferred, order, executor, close, handle } =
          nd.data as ResultNode["data"];

        const ordered = [
          preferred,
          ...actions
            .filter((ac) => ac !== preferred)
            .sort((a, b) => order.indexOf(a) - order.indexOf(b)),
        ];

        return {
          id: nd.id,
          message,
          preferred,
          actions: ordered,
          executor,
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

  /* Actions */

  private resolveConditionTarget(actionId: string) {
    const trueConnection = this.edges.find(
      (ed) => ed.source === actionId && ed.sourceHandle === "condition_true"
    );

    const falseConnection = this.edges.find(
      (ed) => ed.source === actionId && ed.sourceHandle === "condition_false"
    );

    return { true: trueConnection?.target, false: falseConnection?.target };
  }

  private resolveConditions(): Condition[] {
    return this.nodes
      .filter((nd) => nd.type === "conditional")
      .map((nd) => {
        const { value, condition, handle, objective } =
          nd.data as ConditionalNode["data"];

        const target = this.resolveConditionTarget(nd.id);
        if (!target.true || !target.false) return;

        return {
          id: nd.id,
          value,
          condition,
          objective,
          target,
          node: { position: nd.position, handle },
        };
      })
      .filter((p) => p !== undefined);
  }
}

/* Parsing */

function parseFlow(data: Document) {
  const nodes = [
    {
      id: "INITIAL",
      type: "initial",
      origin: [0.5, 0.5],
      position: { x: 0, y: 0 },
      draggable: false,
      data: {},
    },
  ] as FlowNode[];
  const edges = [] as Edge[];

  data.results.map((res) => {
    const { id, message, preferred, actions, close, node } = res;

    nodes.push({
      id,
      type: "result",
      position: node.position,
      origin: [0.5, 0.5],
      data: {
        message,
        preferred,
        order: actions.filter((r) => r !== preferred),
        executor: res.executor || [],
        close,
        handle: node.handle,
      },
    });

    actions.map((ac) => {
      edges.push({
        id: `${id}-${ac}`,
        type: "step",
        source: id,
        sourceHandle: "result_actions",
        target: ac,
        targetHandle: "action_owner",
      });
    });

    /* Support old manifests */
    if ((data.initial && data.initial.id === id) || (res as any).initial) {
      edges.push({
        id: `INITIAL-${id}`,
        type: "step",
        animated: true,
        source: "INITIAL",
        sourceHandle: "initial_target",
        target: id,
        targetHandle: "node_trigger",
      });
    }
  });

  /* Support old manifests */
  if (data.conditions)
    data.conditions.map((cond) => {
      const { id, condition, objective, target, value, node } = cond;

      nodes.push({
        id,
        type: "conditional",
        position: node.position,
        origin: [0.5, 0.5],
        data: {
          condition,
          objective,
          target,
          value,
          handle: node.handle,
        },
      });

      if (target.true) {
        edges.push({
          id: `${id}-${target.true}`,
          type: "step",
          animated: true,
          source: id,
          sourceHandle: "condition_true",
          target: target.true,
          targetHandle: "node_trigger",
        });
      }

      if (target.false) {
        edges.push({
          id: `${id}-${target.false}`,
          type: "step",
          animated: true,
          source: id,
          sourceHandle: "condition_true",
          target: target.false,
          targetHandle: "node_trigger",
        });
      }

      if (data.initial.id === id) {
        edges.push({
          id: `INITIAL-${id}`,
          type: "step",
          animated: true,
          source: "INITIAL",
          sourceHandle: "initial_target",
          target: id,
          targetHandle: "node_trigger",
        });
      }
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
      targetHandle: "node_trigger",
    });
  });

  return { nodes, edges };
}

/* Rendering */

function renderFlow(nodes: FlowNode[], edges: Edge[]) {
  return new Render(nodes, edges).generate();
}

/* Create */

function createNode<T extends FlowNodeType>(
  type: T,
  position: XYPosition,
  id?: string
): FlowNodeTypeRelation[T] {
  let defaultData = {} as FlowNodeTypeRelation[T]["data"];

  switch (type) {
    case "result":
      defaultData = {
        message: "",
        preferred: "",
        order: [],
        close: { enabled: false, delay: 1000 },
        executor: [],
        handle: {
          trigger: Position.Left,
          actions: Position.Right,
        },
      };
      break;

    case "action":
      defaultData = {
        label: "",
        handle: {
          owner: Position.Left,
          result: Position.Right,
        },
      };
      break;

    case "conditional":
      defaultData = {
        value: "",
        condition: "equal",
        objective: "",
        handle: {
          trigger: Position.Left,
          true: Position.Right,
          false: Position.Right,
        },
      };
      break;
  }

  return {
    id: id || crypto.randomUUID(),
    type,
    position,
    origin: [0.5, 0.5],
    data: defaultData,
  } as FlowNodeTypeRelation[T];
}

export default { renderFlow, parseFlow, createNode };
