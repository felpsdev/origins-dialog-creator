import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
} from "@mui/joy";
import {
  getConnectedEdges,
  NodeProps,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback } from "react";
import { GoTrash } from "react-icons/go";
import {
  PiEquals,
  PiGreaterThan,
  PiGreaterThanOrEqual,
  PiLessThan,
  PiLessThanOrEqual,
  PiNotEquals,
} from "react-icons/pi";
import colors from "tailwindcss/colors";
import { ConditionalNode as ConditionalNodeType } from "../../types";
import parser from "../../utils/parser";
import Handle from "../switchable-handle";

const conditions = {
  equal: {
    label: "Igual",
    icon: <PiEquals />,
  },
  not_equal: {
    label: "Não Igual",
    icon: <PiNotEquals />,
  },
  greater_than: {
    label: "Maior",
    icon: <PiGreaterThan />,
  },
  greater_than_or_equal: {
    label: "Maior ou igual",
    icon: <PiGreaterThanOrEqual />,
  },
  less_than: {
    label: "Menor",
    icon: <PiLessThan />,
  },
  less_than_or_equal: {
    label: "Menor ou igual",
    icon: <PiLessThanOrEqual />,
  },
};

interface ConditionalNodeProps extends NodeProps {
  data: ConditionalNodeType["data"];
}

const ConditionalNode = (props: ConditionalNodeProps) => {
  const { id, data, selected } = props;
  const { handle } = data;

  const { updateNodeData, setNodes, setEdges, getNode, getEdges } =
    useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

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
      className="bg-zinc-800 border-2 flex flex-col select-none rounded-md min-w-[300px] font-[inter]"
      style={{ borderColor: selected ? colors.emerald[600] : colors.zinc[700] }}
    >
      <div className="pr-2 pl-4 py-2 flex bg-zinc-900 border-b-2 border-b-zinc-700 rounded-t-md">
        <span className="text-white text-lg font-bold">Condição</span>
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
        label="Gatilho"
        position={handle.trigger}
        onPositionChange={(pos) => {
          updateNodeData(id, {
            handle: {
              ...handle,
              trigger: pos,
            },
          });
          updateNodeInternals(id);
        }}
        handle={{
          type: "target",
          id: "node_trigger",
          isValidConnection: (conn) =>
            conn.sourceHandle === "action_result" ||
            conn.sourceHandle === "initial_target" ||
            conn.sourceHandle?.includes("condition_") ||
            false,
        }}
      />

      <div className="flex flex-col gap-2.5 px-5 bg-black bg-opacity-20 py-3">
        <FormControl size="sm">
          <FormLabel>Valor</FormLabel>
          <Input
            value={data.value}
            onChange={(evt) =>
              updateNodeData(id, {
                value: evt.currentTarget.value,
              })
            }
            className="nodrag w-full"
            placeholder="Digite aqui..."
          />
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Condicional</FormLabel>
          <Select
            value={data.condition}
            onChange={(_, value) => updateNodeData(id, { condition: value })}
            renderValue={(option) => (
              <div className="flex gap-2 items-center">
                {option?.value && conditions[option?.value].icon}
                {option?.label}
              </div>
            )}
            placeholder="Selecione aqui..."
            className="nodrag w-full"
          >
            {Object.entries(conditions).map((row) => (
              <Option className="flex gap-2" key={row[0]} value={row[0]}>
                {row[1].icon}
                {row[1].label}
              </Option>
            ))}
          </Select>
        </FormControl>

        <FormControl size="sm">
          <FormLabel>Valor Comparativo</FormLabel>
          <Input
            value={parser.transform(data.objective)}
            onChange={(evt) =>
              updateNodeData(id, {
                objective: parser.value(evt.currentTarget.value),
              })
            }
            className="nodrag"
            placeholder="Digite aqui..."
          />
        </FormControl>
      </div>

      <div className="flex flex-col">
        <Handle
          label="True"
          position={handle.true}
          onPositionChange={(pos) => {
            updateNodeData(id, {
              handle: {
                ...handle,
                true: pos,
              },
            });
            updateNodeInternals(id);
          }}
          handle={{
            type: "source",
            id: "condition_true",
            isValidConnection: (conn) => conn.targetHandle === "node_trigger",
          }}
        />

        <Handle
          label="False"
          position={handle.false}
          onPositionChange={(pos) => {
            updateNodeData(id, {
              handle: {
                ...handle,
                false: pos,
              },
            });
            updateNodeInternals(id);
          }}
          handle={{
            type: "source",
            id: "condition_false",
            isValidConnection: (conn) => conn.targetHandle === "node_trigger",
          }}
        />
      </div>
    </div>
  );
};

export default ConditionalNode;
