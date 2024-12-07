import { Button } from "@mui/joy";
import {
  addEdge,
  Background,
  Connection,
  Edge,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
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
import { GoCodeSquare, GoCrossReference, GoKey } from "react-icons/go";
import { FlowNode } from "../types";
import render from "../utils/render";
import ActionNode from "./nodes/action-node";
import ConditionalNode from "./nodes/conditional-node";
import InitialNode from "./nodes/initial-node";
import ResultNode from "./nodes/result-node";

const storageKey = "saas-dialogs-cache";

interface NodesProps {
  nodes: FlowNode[];
  setNodes: Dispatch<SetStateAction<FlowNode[]>>;
  onNodesChange: OnNodesChange<FlowNode>;
  edges: Edge[];
  setEdges: Dispatch<SetStateAction<Edge[]>>;
  onEdgesChange: OnEdgesChange<Edge>;
}

const Nodes = (props: NodesProps) => {
  const { nodes, setNodes, onNodesChange, edges, setEdges, onEdgesChange } =
    props;

  const flowRef = useRef<HTMLDivElement>(null);
  const nodeTypes = useMemo(
    () => ({
      result: ResultNode,
      action: ActionNode,
      conditional: ConditionalNode,
      initial: InitialNode,
    }),
    []
  );

  const { screenToFlowPosition, fitView } = useReactFlow();
  const [loaded, setLoaded] = useState(false);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
            animated: connection.targetHandle === "node_trigger",
          } as Connection,
          eds
        )
      ),
    [setEdges]
  );

  /* Persist */

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setLoaded(true);
      return;
    }

    const { nodes, edges } = JSON.parse(
      localStorage.getItem(storageKey) as string
    );

    if (nodes) setNodes(nodes);
    if (edges) setEdges(edges.map((e: Edge) => ({ ...e, type: "step" })));

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(storageKey, JSON.stringify({ nodes, edges }));
    }
  }, [nodes, edges, loaded]);

  /* Center */

  const handleGetCenterPoint = useCallback(() => {
    const bounding = flowRef.current?.getBoundingClientRect();
    if (!bounding) return;

    const pos = screenToFlowPosition({
      x: (bounding.x + bounding.width) / 2,
      y: (bounding.y + bounding.height) / 2,
    });

    return pos;
  }, [flowRef, screenToFlowPosition]);

  /* Creation */

  const handleCreateResult = useCallback(() => {
    const pos = handleGetCenterPoint();
    if (!pos) return;

    const node = render.createNode("result", pos);

    setNodes((nds) => [...nds, node]);
    if (nodes.length === 0) {
      setTimeout(() => fitView(), 20);
    }
  }, [nodes, fitView, handleGetCenterPoint, setNodes]);

  const handleCreateAction = useCallback(() => {
    const pos = handleGetCenterPoint();
    if (!pos) return;

    const node = render.createNode("action", pos);

    setNodes((nds) => [...nds, node]);
  }, [handleGetCenterPoint, setNodes]);

  const handleCreateConditional = useCallback(() => {
    const pos = handleGetCenterPoint();
    if (!pos) return;

    const node = render.createNode("conditional", pos);

    setNodes((nds) => [...nds, node]);
  }, [handleGetCenterPoint, setNodes]);

  return (
    <ReactFlow
      ref={flowRef}
      minZoom={0.2}
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

        <Button
          onClick={handleCreateConditional}
          startDecorator={<GoKey size={20} />}
        >
          Criar Condição
        </Button>
      </div>
    </ReactFlow>
  );
};

export default Nodes;
