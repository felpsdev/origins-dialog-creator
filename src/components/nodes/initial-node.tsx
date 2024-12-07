import { Position, useHandleConnections } from "@xyflow/react";
import Handle from "../switchable-handle";

const InitialNode = () => {
  const target = useHandleConnections({
    type: "source",
    id: "initial_target",
  });

  return (
    <div className="bg-zinc-800 border-2 border-zinc-700 flex flex-col select-none rounded-md w-fit font-[inter]">
      <div className="pr-2 pl-4 py-2 flex bg-zinc-900 border-b-2 border-b-zinc-700 rounded-t-md">
        <span className="text-white text-lg font-bold">Início</span>
      </div>

      <div className="ml-4">
        <Handle
          label="Objeto Inicial"
          position={Position.Right}
          handle={{
            type: "source",
            id: "initial_target",
            isValidConnection: (conn) => conn.targetHandle === "node_trigger",
            isConnectable: target.length === 0,
          }}
        />
      </div>
    </div>
  );
};

export default InitialNode;
