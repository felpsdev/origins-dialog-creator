import { Input } from "@mui/joy";
import { useMemo } from "react";
import { GoCommandPalette, GoDatabase, GoX } from "react-icons/go";
import { ResultExecutorType, ResultExecutorValueRelation } from "../../types";
import parser from "../../utils/parser";

interface ResultExecutorProps {
  type: ResultExecutorType;
  value: ResultExecutorValueRelation[ResultExecutorType];
  onChange: (value: ResultExecutorValueRelation[ResultExecutorType]) => void;
  onRemove: () => void;
}

export const executorRelation = {
  command: {
    label: "Comando",
    icon: (
      <GoCommandPalette className="bg-green-600 text-green-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
  },
  dialog_store: {
    label: "Banco de Dados (DS)",
    icon: (
      <GoDatabase className="bg-purple-600 text-purple-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
  },
};

const ResultExecutor = (props: ResultExecutorProps) => {
  const { type, value, onChange, onRemove } = props;
  const theme = useMemo(() => executorRelation[type], [type]);

  return (
    <div className="w-full h-fit bg-zinc-700 rounded-sm p-2 shadow-md flex gap-2 relative nodrag">
      {theme.icon}

      <GoX
        className="absolute right-2 top-2 text-xs text-zinc-400 cursor-pointer"
        onClick={onRemove}
      />

      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-white">{theme.label}</span>

        {type === "command" ? (
          <Input
            size="sm"
            className="w-[100%] !text-xs !px-2 !rounded-sm nodrag"
            variant="plain"
            placeholder="Digite aqui..."
            value={value as string}
            onChange={(evt) => onChange(evt.currentTarget.value)}
          />
        ) : (
          <div className="flex gap-2 w-full">
            <Input
              size="sm"
              className="w-[41.5%] !text-xs !px-2 !rounded-sm nodrag"
              variant="plain"
              placeholder="Chave"
              value={(value as any).key}
              onChange={(evt) =>
                onChange({
                  ...(value as ResultExecutorValueRelation["dialog_store"]),
                  key: evt.currentTarget.value,
                })
              }
            />
            <Input
              size="sm"
              className="w-[41.5%] !text-xs !px-2 !rounded-sm nodrag"
              variant="plain"
              placeholder="Valor"
              value={parser.transform((value as any).value)}
              onChange={(evt) =>
                onChange({
                  ...(value as ResultExecutorValueRelation["dialog_store"]),
                  value: parser.value(evt.currentTarget.value),
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultExecutor;
