import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { ReactNode, useState } from "react";

export default function ResourceFolder({
  title,
  icon,
  children,
  onAdd,
  count,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onAdd: () => void;
  count?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-800/70 bg-[#131820]/50">
      <div
        className="flex cursor-pointer select-none items-center justify-between px-3 py-2.5 transition-colors hover:bg-slate-800/20"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          )}
          <span className="text-slate-400">{icon}</span>
          <span className="truncate text-sm font-medium text-slate-300">
            {title}
          </span>
          {typeof count === "number" && (
            <span className="rounded-md bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              {count}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
          title={`Add ${title}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {isOpen && (
        <div className="border-t border-slate-800/60 px-1.5 py-1.5">
          {children}
        </div>
      )}
    </div>
  );
}