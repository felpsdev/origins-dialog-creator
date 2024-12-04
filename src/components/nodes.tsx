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
import { GoCodeSquare, GoCrossReference } from "react-icons/go";
import { ActionNode, ResultNode } from "../types";
import render from "../utils/render";
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

  const { screenToFlowPosition, fitView } = useReactFlow();
  const [loaded, setLoaded] = useState(false);

  const onConnect: OnConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
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

  /* Handling */

  const handleGetCenterPoint = useCallback(() => {
    const bounding = flowRef.current?.getBoundingClientRect();
    if (!bounding) return;

    const pos = screenToFlowPosition({
      x: (bounding.x + bounding.width) / 2,
      y: (bounding.y + bounding.height) / 2,
    });

    return pos;
  }, [flowRef, screenToFlowPosition]);

  const handleCreateResult = useCallback(() => {
    const pos = handleGetCenterPoint();
    if (!pos) return;

    const node = render.createNode("result", pos);
    if (
      nodes.filter(
        (nd: any) => nd.type === "result" && nd.data.initial === true
      ).length === 0
    ) {
      node.data.initial = true;
      node.draggable = false;
      node.position = { x: 0, y: 0 };
    }

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
      </div>
    </ReactFlow>
  );
};

export default Nodes;
