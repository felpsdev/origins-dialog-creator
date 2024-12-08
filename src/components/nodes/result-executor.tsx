import { Input } from "@mui/joy";
import { ReactNode, useMemo } from "react";
import { GoCommandPalette, GoDatabase, GoX } from "react-icons/go";
import { LiaCoinsSolid, LiaGemSolid } from "react-icons/lia";
import { PiStorefront } from "react-icons/pi";
import { ResultExecutorType, ResultExecutorValueRelation } from "../../types";
import parser from "../../utils/parser";

interface ResultExecutorProps {
  type: ResultExecutorType;
  value: ResultExecutorValueRelation[ResultExecutorType];
  onChange: (value: ResultExecutorValueRelation[ResultExecutorType]) => void;
  onRemove: () => void;
}

interface ExecutorRelationRow {
  label: string;
  icon: ReactNode;
  component: (
    value: ResultExecutorValueRelation[ResultExecutorType],
    onChange: (value: ResultExecutorValueRelation[ResultExecutorType]) => void
  ) => ReactNode;
}

export const executorRelation = {
  command: {
    label: "Comando",
    icon: (
      <GoCommandPalette className="bg-teal-600 text-teal-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
    component: (
      value: ResultExecutorValueRelation["command"],
      onChange: (value: ResultExecutorValueRelation["command"]) => void
    ) => (
      <Input
        size="sm"
        className="w-[100%] !text-xs !px-2 !rounded-sm nodrag"
        variant="plain"
        placeholder="Digite aqui..."
        value={value}
        onChange={(evt) => onChange(evt.currentTarget.value)}
      />
    ),
  },
  dialog_store: {
    label: "Dialog Store",
    icon: (
      <GoDatabase className="bg-purple-600 text-purple-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
    component: (
      value: ResultExecutorValueRelation["dialog_store"],
      onChange: (value: ResultExecutorValueRelation["dialog_store"]) => void
    ) => (
      <div className="flex gap-2 w-full">
        <Input
          size="sm"
          className="w-[41.5%] !text-xs !px-2 !rounded-sm nodrag"
          variant="plain"
          placeholder="Chave"
          value={value.key}
          onChange={(evt) =>
            onChange({
              ...value,
              key: evt.currentTarget.value,
            })
          }
        />
        <Input
          size="sm"
          className="w-[41.5%] !text-xs !px-2 !rounded-sm nodrag"
          variant="plain"
          placeholder="Valor"
          value={parser.transform(value.value)}
          onChange={(evt) =>
            onChange({
              ...value,
              value: parser.value(evt.currentTarget.value),
            })
          }
        />
      </div>
    ),
  },
  set_coins: {
    label: "Setar Coins",
    icon: (
      <LiaCoinsSolid className="bg-yellow-600 text-yellow-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
    component: (
      value: ResultExecutorValueRelation["set_coins"],
      onChange: (value: ResultExecutorValueRelation["set_coins"]) => void
    ) => (
      <Input
        size="sm"
        className="w-[100%] !text-xs !px-2 !rounded-sm nodrag"
        variant="plain"
        placeholder="Quantidade"
        value={parser.transform(value)}
        onChange={(evt) =>
          onChange(
            parser.value(
              evt.currentTarget.value
            ) as ResultExecutorValueRelation["set_coins"]
          )
        }
      />
    ),
  },
  set_gems: {
    label: "Setar Gemas",
    icon: (
      <LiaGemSolid className="bg-green-600 text-green-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
    component: (
      value: ResultExecutorValueRelation["set_gems"],
      onChange: (value: ResultExecutorValueRelation["set_gems"]) => void
    ) => (
      <Input
        size="sm"
        className="w-[100%] !text-xs !px-2 !rounded-sm nodrag"
        variant="plain"
        placeholder="Quantidade"
        value={parser.transform(value)}
        onChange={(evt) =>
          onChange(
            parser.value(
              evt.currentTarget.value
            ) as ResultExecutorValueRelation["set_gems"]
          )
        }
      />
    ),
  },
  open_market: {
    label: "Abrir Loja",
    icon: (
      <PiStorefront className="bg-blue-600 text-blue-500 bg-opacity-50 p-1 rounded-sm text-2xl min-w-fit" />
    ),
    component: (value: string, onChange: (value: string) => void) => (
      <Input
        size="sm"
        className="w-[100%] !text-xs !px-2 !rounded-sm nodrag"
        variant="plain"
        placeholder="Id da loja"
        value={value as string}
        onChange={(evt) => onChange(evt.currentTarget.value)}
      />
    ),
  },
} as Record<string, ExecutorRelationRow>;

const ResultExecutor = (props: ResultExecutorProps) => {
  const { type, value, onChange, onRemove } = props;

  const relation = useMemo(() => executorRelation[type], [type]);
  const component = useMemo(
    () => relation.component(value, onChange),
    [relation, value, onChange]
  );

  return (
    <div className="w-full h-fit bg-zinc-700 rounded-sm p-2 shadow-md flex gap-2 relative nodrag">
      {relation.icon}

      <GoX
        className="absolute right-2 top-2 text-xs text-zinc-400 cursor-pointer"
        onClick={onRemove}
      />

      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-white">{relation.label}</span>
        {component}
      </div>
    </div>
  );
};

export default ResultExecutor;
