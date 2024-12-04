import {
  Checkbox,
  Chip,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Option,
  Select,
  Textarea,
} from "@mui/joy";
import {
  getConnectedEdges,
  NodeProps,
  useHandleConnections,
  useNodesData,
  useReactFlow,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { useCallback, useEffect } from "react";
import { GoTrash } from "react-icons/go";
import SwitchableHandle from "./switchable-handle";

const ResultNode = (props: NodeProps) => {
  const { id, data } = props;
  const { handle } = data as any;

  const { updateNodeData, setNodes, setEdges, getNode, getEdges } =
    useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  /* Actions */
  const actions = useHandleConnections({
    type: "source",
    id: "result_actions",
  });
  const actionsData = useNodesData(actions.map((row) => row.target));

  useEffect(() => {
    if (actionsData.length === 0) return;

    if (
      !data.preferredId ||
      !actionsData.find((acd) => acd.id === data.preferredId)
    ) {
      updateNodeData(id, { preferredId: actionsData[0].id });
    }
  }, [actionsData, data, id, updateNodeData]);

  /* Nodes */

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
    <div className="bg-zinc-800 border-2 border-zinc-700 flex flex-col select-none rounded-md w-[300px] font-[inter]">
      <div className="pr-2 pl-4 py-2 flex bg-zinc-900 border-b-2 border-b-zinc-700 rounded-t-md items-center">
        <span className="text-white text-lg font-bold">
          {data.initial ? "Início" : "Resultado"}
        </span>
        <IconButton
          sx={{ ml: "auto", mr: 0, borderRadius: 4 }}
          color="danger"
          size="sm"
          onClick={removeNode}
        >
          <GoTrash />
        </IconButton>
      </div>

      <SwitchableHandle
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
          id: "result_trigger",
          isValidConnection: (conn) => conn.sourceHandle === "action_result",
        }}
      />

      <div className="flex flex-col gap-2.5 px-5 bg-black bg-opacity-20 py-4">
        <FormControl size="sm">
          <FormLabel sx={{ lineHeight: "1", marginBottom: "8px" }}>
            Mensagem
          </FormLabel>
          <Textarea
            minRows={3}
            placeholder="Digite aqui..."
            value={data.message as string}
            onChange={(evt) =>
              updateNodeData(id, { message: evt.currentTarget.value })
            }
          />
        </FormControl>

        {actionsData.length > 0 && (
          <FormControl size="sm">
            <FormLabel>Ação Principal</FormLabel>
            <Select
              value={data.preferredId}
              onChange={(_, value) =>
                updateNodeData(id, { preferredId: value })
              }
              placeholder="Selecione"
            >
              {actionsData.map((row) => (
                <Option key={row.id} value={row.id}>
                  {row.data.label as string}
                </Option>
              ))}
            </Select>
          </FormControl>
        )}

        {actionsData.length > 2 && (
          <FormControl size="sm">
            <FormLabel>Ordem das ações</FormLabel>
            <Select
              multiple
              value={data.actionsOrder as string[]}
              placeholder="Selecione a ordem"
              renderValue={(selected) => (
                <div className="flex gap-1 flex-wrap py-2">
                  {selected.map((option) => (
                    <Chip
                      size="sm"
                      sx={{ borderRadius: 4 }}
                      variant="solid"
                      color="neutral"
                      key={option.value}
                    >
                      {option.label}
                    </Chip>
                  ))}
                </div>
              )}
              onChange={(_, order) =>
                updateNodeData(id, { actionsOrder: order })
              }
              slotProps={{
                listbox: {
                  sx: {
                    width: "100%",
                  },
                },
              }}
            >
              {actionsData
                .filter((row) => row.id !== data.preferredId)
                .map((row) => (
                  <Option
                    key={row.id}
                    value={row.id}
                    label={row.data.label as string}
                  >
                    {row.data.label as string}
                  </Option>
                ))}
            </Select>
          </FormControl>
        )}

        {data.initial === false && actionsData.length === 0 && (
          <Checkbox
            checked={data.closeOnFinish as boolean}
            onChange={(evt) =>
              updateNodeData(id, { closeOnFinish: evt.currentTarget.checked })
            }
            size="sm"
            label="Fechar ao terminar"
          />
        )}

        {data.closeOnFinish === true && (
          <div className="mb-2">
            <FormControl size="sm">
              <FormLabel>Delay</FormLabel>
              <Input
                type="number"
                value={data.closeDelay as string}
                onChange={(evt) =>
                  updateNodeData(id, {
                    closeDelay: parseInt(evt.currentTarget.value),
                  })
                }
                placeholder="Digite aqui..."
                endDecorator="ms"
              />
            </FormControl>
          </div>
        )}
      </div>

      {!data.closeOnFinish && (
        <SwitchableHandle
          label="Ações"
          position={handle.actions}
          onPositionChange={(pos) => {
            updateNodeData(id, {
              handle: {
                ...handle,
                actions: pos,
              },
            });
            updateNodeInternals(id);
          }}
          handle={{
            type: "source",
            id: "result_actions",
            isValidConnection: (conn) => conn.targetHandle === "action_owner",
          }}
        />
      )}
    </div>
  );
};

export default ResultNode;
