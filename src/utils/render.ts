import { Edge, Node } from "@xyflow/react";

/* Path -> [...[Previous-Node.id, Node.id, Action.id]] */
type Path = Array<Array<string | null>>;

interface Result {
  for: string[];
  response: Response;
}

interface Response {
  message: string;
  actions: Action[];
  result: Result[];
  shouldClose?: boolean;
  closeWhen?: string;
  closeTimeout?: number;
}

interface Action {
  key: string;
  label: string;
  preferred: boolean;
}

class Render {
  private nodes: Node[] = [];
  private edges: Edge[] = [];

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  public generate() {
    const initial = this.findInitial();
    if (!initial) return;

    const actions = this.resolveActions(initial);
    const response = this.resolveResponse(initial, actions, [
      [null, initial.id, null],
    ]);

    return response;
  }

  private findInitial() {
    return this.nodes.find((row) => row.data.initial === true);
  }

  /* Actions */

  private formatActions(actions: Node[], preferredId: string): Action[] {
    return actions.map((row) => ({
      key: row.id as string,
      label: row.data.label as string,
      preferred: row.id === preferredId,
    }));
  }

  private resolveActions(target: Node) {
    return this.edges
      .filter((ed) => ed.source === target.id)
      .map((ed) =>
        this.nodes.find((nd) => nd.id === ed.target && nd.type === "action")
      ) as Node[];
  }

  private resolveResponse(
    current: Node,
    actions: Node[],
    path: Path
  ): Response {
    const invalidActions = [] as string[];
    const cache = {} as Record<string, Result>;

    actions.map((ac) => {
      const targetEdge = this.edges.find(
        (row) => row.source === ac.id && row.targetHandle === "result_trigger"
      );
      const targetNode = this.nodes.find((nd) => nd.id === targetEdge?.target);
      if (!targetNode) {
        invalidActions.push(ac.id);
        return;
      }

      /* Already Cached */
      if (cache[targetNode.id]) {
        cache[targetNode.id].for.push(ac.id);
        return;
      }

      let targetActions = this.resolveActions(targetNode);

      /* Target  */
      if (targetNode.id === current.id) {
        targetActions.splice(targetActions.indexOf(ac), 1);
      }

      /* Same target */
      const sameTarget = path.filter(
        (pt) => pt[0] === targetNode.id && pt[1] === targetNode.id
      );
      if (sameTarget.length > 0) {
        sameTarget.map(
          (pt) =>
            (targetActions = targetActions.filter((tac) => tac.id !== pt[2]))
        );
      }

      /* Already on path */
      const alreadyOnPath = path.find(
        (pt) => pt[0] === targetNode.id && pt[1] && pt[2]
      );
      if (alreadyOnPath) {
        targetActions = targetActions.filter(
          (tac) => tac.id !== alreadyOnPath[2]
        );
      }

      const targetResponse = this.resolveResponse(targetNode, targetActions, [
        ...path,
        [current.id, targetNode.id, ac.id],
      ]);

      cache[targetNode.id] = {
        for: [ac.id],
        response: targetResponse,
      };

      return cache[targetNode.id];
    });

    const { message, preferredId, actionsOrder, ...currentData } = current.data;

    /* Validating/Sorting actions */
    const order = actionsOrder as string[];
    let validActions = actions
      .filter((ac) => !invalidActions.includes(ac.id))
      .sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

    /* Sorting preferred */
    const preferred = validActions.find((vac) => vac.id === preferredId);
    if (preferred) {
      validActions = validActions.filter((row) => row.id !== preferredId);
      validActions.splice(0, 0, preferred);
    }

    const response = {
      message: message as string,
      actions: this.formatActions(validActions, preferredId as string),
      result: Object.values(cache),
    } as Response;

    /* Close on finish */
    if (currentData.closeOnFinish || validActions.length === 0) {
      response.shouldClose = true;
      response.closeWhen = "finish";
      response.closeTimeout = (currentData.closeDelay || 1000) as number;
    }

    return response;
  }
}

function renderFlow(nodes: Node[], edges: Edge[]) {
  return new Render(nodes, edges).generate();
}

export default { renderFlow };
