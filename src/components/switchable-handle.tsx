import { Handle, HandleProps, Position } from "@xyflow/react";

interface SwitchableHandleProps {
  label: string;
  className?: string;
  handle?: Omit<HandleProps, "position">;
  position: Position.Left | Position.Right;
  onPositionChange: (newPos: "left" | "right") => void;
}

const SwitchableHandle = (props: SwitchableHandleProps) => {
  const { label, handle, position, onPositionChange } = props;
  return (
    <div
      className="flex gap-2 py-2 items-center w-full"
      style={{
        justifyContent: position === Position.Right ? "end" : "initial",
        flexDirection: position === Position.Right ? "row-reverse" : "row",
      }}
    >
      <Handle
        {...(handle as HandleProps)}
        position={position}
        className="relative w-2.5 h-2.5 !top-0 transform-none bg-zinc-600 border-2 border-zinc-500 m-0 rounded-full"
        style={position === Position.Left ? { left: -6.5 } : { right: -5.5 }}
      />
      <span
        className="text-white text-sm cursor-pointer"
        onClick={() =>
          onPositionChange(
            position === Position.Left ? Position.Right : Position.Left
          )
        }
      >
        {label}
      </span>
    </div>
  );
};

export default SwitchableHandle;
