import { Chip, FormControl, FormLabel, IconButton, Input } from "@mui/joy";
import {
  getConnectedEdges,
  NodeProps,
  Position,
  useHandleConnections,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback, useMemo } from "react";
import { GoTrash } from "react-icons/go";
import colors from "tailwindcss/colors";
import { ActionNode as ActionNodeType } from "../../types";
import Handle from "../switchable-handle";

interface ActionNodeProps extends NodeProps {
  data: ActionNodeType["data"];
}

const ActionNode = (props: ActionNodeProps) => {
  const { id, data, selected } = props;
  const { handle } = data;

  const { updateNodeData, setNodes, setEdges, getNode, getEdges } =
    useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const result = useHandleConnections({
    type: "source",
    id: "action_result",
  });
  const owners = useHandleConnections({
    type: "target",
    id: "action_owner",
  });

  const isDead = useMemo(
    () => result.length === 0 && owners.length > 0,
    [owners, result]
  );

  const removeNode = useCallback(() => {
    const node = getNode(id);
    if (!node) return;

    const connected = getConnectedEdges([node], getEdges()).map(
      (edge) => edge.id
    );

    setEdges((edges) => edges.filter((row) => !connected.includes(row.id)));
    setNodes((nodes) => nodes.filter((row) => row.id !== id));
  }, [id, getEdges, getNode, setNodes, setEdges]);

  return (
    <div
      className="bg-zinc-800 border-2 border-zinc-700 flex flex-col select-none rounded-md min-w-[300px] font-[inter]"
      style={{ borderColor: selected ? colors.indigo[500] : colors.zinc[700] }}
    >
      <div className="pr-2 pl-4 py-2 flex bg-zinc-900 border-b-2 border-b-zinc-700 rounded-t-md">
        <span className="text-white text-lg font-bold">Ação</span>
        <IconButton
          sx={{ ml: "auto", mr: 0, borderRadius: 4 }}
          color="danger"
          size="sm"
          onClick={removeNode}
        >
          <GoTrash />
        </IconButton>
      </div>

      <Handle
        label="Proprietário"
        position={handle.owner}
        onPositionChange={(pos) => {
          updateNodeData(id, {
            handle: {
              ...handle,
              owner: pos,
            },
          });
          updateNodeInternals(id);
        }}
        handle={{
          type: "target",
          id: "action_owner",
          isValidConnection: (conn) => conn.sourceHandle === "result_actions",
        }}
      />

      <div className="flex flex-col gap-2.5 px-5 bg-black bg-opacity-20 py-3">
        <FormControl size="sm">
          <FormLabel>Conteúdo</FormLabel>
          <Input
            value={data.label as string}
            onChange={(evt) =>
              updateNodeData(id, { label: evt.currentTarget.value })
            }
            className="nodrag"
            placeholder="Digite aqui..."
          />
        </FormControl>
      </div>

      <div
        className="flex w-full py-1"
        style={{
          flexDirection:
            handle.result === Position.Left ? "row-reverse" : "row",
        }}
      >
        {isDead && (
          <div className="mx-2 flex items-center">
            <Chip
              color="danger"
              size="sm"
              sx={{ fontFamily: "jetbrains mono", borderRadius: 2 }}
            >
              AÇÃO SEM RESULTADO
            </Chip>
          </div>
        )}

        <Handle
          label="Resultado"
          position={handle.result}
          onPositionChange={(pos) => {
            updateNodeData(id, {
              handle: {
                ...handle,
                result: pos,
              },
            });
            updateNodeInternals(id);
          }}
          handle={{
            type: "source",
            id: "action_result",
            isValidConnection: (conn) =>
              conn.targetHandle === "node_trigger" ||
              conn.targetHandle === "node_trigger",
            isConnectable: result.length === 0,
          }}
        />
      </div>
    </div>
  );
};

export default ActionNode;
