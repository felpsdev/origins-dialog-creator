import {
  Checkbox,
  Chip,
  Dropdown,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
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
import { GoPlus, GoTrash } from "react-icons/go";
import {
  ResultExecutorType,
  ResultExecutorValueRelation,
  ResultNode as ResultNodeType,
} from "../../types";
import Handle from "../switchable-handle";
import ResultExecutor, { executorRelation } from "./result-executor";

interface ResultNodeProps extends NodeProps {
  data: ResultNodeType["data"];
}

const ResultNode = (props: ResultNodeProps) => {
  const { id, data } = props;
  const { handle } = data;

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
      !data.preferred ||
      !actionsData.find((acd) => acd.id === data.preferred)
    ) {
      updateNodeData(id, { preferred: actionsData[0].id });
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

  /* Executors */

  const handleCreateExecutor = useCallback(
    (type: ResultExecutorType) => {
      let defaultValue;

      switch (type) {
        case "dialog_store":
          defaultValue = { key: "", value: "" };
          break;

        default:
          defaultValue = "";
      }

      updateNodeData(id, {
        executor: [...(data.executor || []), { type, value: defaultValue }],
      });
    },
    [id, data, updateNodeData]
  );

  const handleModifyExecutor = useCallback(
    (index: number, value: ResultExecutorValueRelation[ResultExecutorType]) => {
      const executor = data.executor || [];
      const target = executor.find((_, i) => i === index);

      if (target) {
        target.value = value;
      }

      updateNodeData(id, {
        executor,
      });
    },
    [id, data, updateNodeData]
  );

  const handleRemoveExecutor = useCallback(
    (index: number) => {
      updateNodeData(id, {
        executor: (data.executor || []).filter((_, i) => i !== index),
      });
    },
    [id, data, updateNodeData]
  );

  return (
    <div className="bg-zinc-800 border-2 border-zinc-700 flex flex-col select-none rounded-md w-[300px] font-[inter]">
      <div className="pr-2 pl-4 py-2 flex bg-zinc-900 border-b-2 border-b-zinc-700 rounded-t-md items-center">
        <span className="text-white text-lg font-bold">Resultado</span>
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

      <div className="flex flex-col gap-2.5 px-5 bg-black bg-opacity-20 py-4 w-full">
        <FormControl size="sm">
          <FormLabel sx={{ lineHeight: "1", marginBottom: "8px" }}>
            Mensagem
          </FormLabel>
          <Textarea
            minRows={3}
            placeholder="Digite aqui..."
            value={data.message as string}
            className="nodrag"
            onChange={(evt) =>
              updateNodeData(id, { message: evt.currentTarget.value })
            }
          />
        </FormControl>

        {actionsData.length > 0 && (
          <FormControl size="sm">
            <FormLabel>Ação Principal</FormLabel>
            <Select
              value={data.preferred}
              onChange={(_, value) => updateNodeData(id, { preferred: value })}
              placeholder="Selecione"
              className="nodrag"
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
              value={data.order as string[]}
              placeholder="Selecione a ordem"
              className="nodrag"
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
              onChange={(_, order) => updateNodeData(id, { order: order })}
              slotProps={{
                listbox: {
                  sx: {
                    width: "100%",
                  },
                },
              }}
            >
              {actionsData
                .filter((row) => row.id !== data.preferred)
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

        <div className="flex flex-col w-full gap-2">
          <div className="flex w-full items-center">
            <span className="text-xs text-[#f0f4f8]">Executores</span>

            <Dropdown>
              <MenuButton
                slots={{ root: "button" }}
                slotProps={{ root: { className: "ml-auto mr-0" } }}
              >
                <GoPlus className="text-[#f0f4f8]" />
              </MenuButton>
              <Menu>
                {Object.entries(executorRelation).map((entry) => (
                  <MenuItem
                    key={entry[0]}
                    onClick={() =>
                      handleCreateExecutor(entry[0] as ResultExecutorType)
                    }
                    className="flex gap-2"
                  >
                    {entry[1].icon}
                    {entry[1].label}
                  </MenuItem>
                ))}
              </Menu>
            </Dropdown>
          </div>

          <div className="flex flex-col gap-2 w-full">
            {(data.executor || []).map((exc, i) => (
              <ResultExecutor
                key={i}
                type={exc.type}
                value={exc.value}
                onChange={(value) => handleModifyExecutor(i, value)}
                onRemove={() => handleRemoveExecutor(i)}
              />
            ))}
          </div>
        </div>

        {actionsData.length === 0 && (
          <Checkbox
            checked={data.close.enabled}
            onChange={(evt) =>
              updateNodeData(id, {
                close: { ...data.close, enabled: evt.currentTarget.checked },
              })
            }
            size="sm"
            className="nodrag"
            label="Fechar ao terminar"
          />
        )}

        {data.close.enabled === true && (
          <div className="mb-2">
            <FormControl size="sm">
              <FormLabel>Delay</FormLabel>
              <Input
                type="number"
                value={data.close.delay}
                className="nodrag"
                onChange={(evt) =>
                  updateNodeData(id, {
                    close: {
                      ...data.close,
                      delay: parseInt(evt.currentTarget.value),
                    },
                  })
                }
                placeholder="Digite aqui..."
                endDecorator="ms"
              />
            </FormControl>
          </div>
        )}
      </div>

      {!data.close.enabled && (
        <Handle
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
