import { ReactNode } from "react";

interface SettingsFieldProps {
  title: ReactNode;
  description?: string;
  children: ReactNode;
}

const SettingsField = (props: SettingsFieldProps) => {
  const { title, children, description } = props;
  return (
    <div className="flex flex-col gap-1.5 w-full bg-black bg-opacity-20 px-4 py-2">
      <span className="text-zinc-200">{title}</span>
      <div className="w-full h-fit">{children}</div>
      {description && (
        <span className="text-sm text-zinc-400">{description}</span>
      )}
    </div>
  );
};

export default SettingsField;
