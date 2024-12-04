import { Button } from "@mui/joy";
import {
  addEdge,
  Background,
  Connection,
  Edge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Position,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { GoCodeSquare, GoCrossReference } from "react-icons/go";
import { ActionNode, ResultNode } from "../types";
import ActionNodeComponent from "./action-node";
import ResultNodeComponent from "./result-node";

const storageKey = "saas-dialogs-cache";

interface NodesProps {
  nodes: (ResultNode | ActionNode)[];
  setNodes: Dispatch<SetStateAction<(ResultNode | ActionNode)[]>>;
  onNodesChange: OnNodesChange<ResultNode | ActionNode>;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
}

const Nodes = (props: NodesProps) => {
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    props;

  const flowRef = useRef<HTMLDivElement>(null);
  const nodeTypes = useMemo(
    () => ({ result: ResultNodeComponent, action: ActionNodeComponent }),
    []
  );

  const { screenToFlowPosition } = useReactFlow();
  const [loaded, setLoaded] = useState(false);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated:
              connection.sourceHandle === "action_result" &&
              connection.targetHandle === "result_trigger",
          } as Connection,
          eds
        )
      ),
    [setEdges]
  );

  /* Persist */

  useEffect(() => {
    const nodes = localStorage.getItem(`${storageKey}.nodes`);
    if (nodes) {
      const parsed = JSON.parse(nodes);
      setNodes(parsed);
    }

    const edges = localStorage.getItem(`${storageKey}.edges`);
    if (edges) {
      const parsed = JSON.parse(edges);
      setEdges(parsed);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(`${storageKey}.nodes`, JSON.stringify(nodes));
      localStorage.setItem(`${storageKey}.edges`, JSON.stringify(edges));
    }
  }, [nodes, edges, loaded]);

  /* Handling */

  const handleGetCenter = useCallback(() => {
    const bounding = flowRef.current?.getBoundingClientRect();
    if (!bounding) return;

    const pos = screenToFlowPosition({
      x: (bounding.x + bounding.width) / 2,
      y: (bounding.y + bounding.height) / 2,
    });

    return pos;
  }, [flowRef, screenToFlowPosition]);

  const handleCreateResult = useCallback(() => {
    const pos = handleGetCenter();
    if (!pos) return;

    setNodes((nds) => [
      ...nds,
      {
        id: crypto.randomUUID(),
        type: "result",
        position: { x: pos.x, y: pos.y },
        origin: [0.5, 0.5],
        data: {
          message: "",
          preferredId: "",
          actionsOrder: [],
          closeOnFinish: false,
          initial: nds.length === 0,
          closeDelay: 1000,
          handle: {
            trigger: Position.Left,
            actions: Position.Right,
          },
        },
      },
    ]);
  }, [handleGetCenter, setNodes]);

  const handleCreateAction = useCallback(() => {
    const pos = handleGetCenter();
    if (!pos) return;

    setNodes((nds) => [
      ...nds,
      {
        id: crypto.randomUUID(),
        type: "action",
        position: { x: pos.x, y: pos.y },
        origin: [0.5, 0.5],
        data: {
          label: "",
          handle: {
            owner: Position.Left,
            result: Position.Right,
          },
        },
      },
    ]);
  }, [handleGetCenter, setNodes]);

  return (
    <ReactFlow
      ref={flowRef}
      className="w-full h-full  border-2 border-zinc-800 select-none"
      colorMode="dark"
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      proOptions={{ hideAttribution: true }}
      fitView
    >
      <Background />
      <div className="flex absolute right-5 bottom-5 p-2 gap-3 z-10">
        <Button
          onClick={handleCreateResult}
          startDecorator={<GoCodeSquare size={20} />}
        >
          Criar Resultado
        </Button>
        <Button
          onClick={handleCreateAction}
          startDecorator={<GoCrossReference size={20} />}
        >
          Criar Ação
        </Button>
      </div>
    </ReactFlow>
  );
};

export default Nodes;
