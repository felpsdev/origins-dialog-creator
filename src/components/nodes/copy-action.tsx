import {
  Edge,
  Node,
  useKeyPress,
  useOnSelectionChange,
  useReactFlow,
  XYPosition,
} from "@xyflow/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import colors from "tailwindcss/colors";
import { FlowNode } from "../../types";

interface SelectionNode {
  position: XYPosition;
  type: FlowNode["type"];
  data: FlowNode["data"];
  sourceId: string;
}

const colorTypeRelation = {
  result: colors.blue[500],
  action: colors.indigo[500],
  conditional: colors.rose[500],
};

function CopyAction() {
  const [selected, setSelected] = useState<SelectionNode[]>([]);
  const [copied, setCopied] = useState<SelectionNode[]>([]);
  const reactFlow = useReactFlow();

  const ctrlPlusCPressed = useKeyPress("Control+c");
  const ctrlPlusVPressed = useKeyPress("Control+v");

  const onChange = useCallback(
    (props: { nodes: Node[] }) => {
      setSelected(
        props.nodes.map((node) => ({
          type: node.type,
          position: node.position,
          data: node.data,
          sourceId: node.id,
        }))
      );

      const ids = props.nodes.map((node) => node.id);
      if (props.nodes.length > 0)
        props.nodes.map((node) => {
          const colorRelation =
            colorTypeRelation[node.type as keyof typeof colorTypeRelation];

          if (colorRelation)
            reactFlow.setEdges((edges: Edge[]) =>
              edges.map((edge) =>
                edge.target === node.id || edge.source === node.id
                  ? { ...edge, style: { stroke: colorRelation } }
                  : {
                      ...edge,
                      style: {
                        stroke:
                          !ids.includes(edge.target) &&
                          !ids.includes(edge.source)
                            ? colors.zinc[700]
                            : edge.style?.stroke,
                      },
                    }
              )
            );
        });
      else
        reactFlow.setEdges((edges: Edge[]) =>
          edges.map((edge) => ({
            ...edge,
            style: { stroke: colors.zinc[700] },
          }))
        );
    },
    [reactFlow]
  );

  useEffect(() => {
    if (ctrlPlusCPressed && selected.length > 0) {
      setCopied(
        selected.map((row) => ({
          type: row.type,
          data: row.data,
          position: { x: row.position.x, y: row.position.y },
          sourceId: row.sourceId,
        }))
      );

      toast("Copiado para área de transferência.");
    }
  }, [ctrlPlusCPressed, selected, setCopied]);

  useEffect(() => {
    if (ctrlPlusVPressed) {
      const sources = copied.map((row) => row.sourceId);

      reactFlow.setNodes((state) => [
        ...state.map((node) =>
          sources.includes(node.id) ? { ...node, selected: false } : node
        ),
        ...(copied.map((node) => ({
          id: crypto.randomUUID(),
          type: node.type,
          data: node.data,
          anchor: [0.5, 0.5],
          position: { x: node.position.x + 10, y: node.position.y + 10 },
          selected: true,
        })) as Node[]),
      ]);
    }
  }, [ctrlPlusVPressed, copied, reactFlow, setCopied]);

  useOnSelectionChange({
    onChange,
  });

  return <div></div>;
}

export default CopyAction;
