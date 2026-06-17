import { Trash2 } from "lucide-react";

export default function ResourceItem({
  name,
  onDelete,
  onClick,
}: {
  name: string;
  onDelete: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 transition-colors hover:bg-slate-800/40"
    >
      <span className="truncate font-mono text-xs text-slate-400 transition-colors group-hover:text-slate-200">
        {name}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
        className="shrink-0 rounded-md p-1 text-slate-600 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}