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
      className="flex items-center justify-between px-4 py-2 rounded-lg w-full
                 text-sm font-medium text-neutral-200
                  hover:bg-[#3a3a3f]
                 hover:text-neutral-100 
                 cursor-pointer transition-all duration-150
                 shadow-sm hover:shadow-md "
    >
      <span className="truncate max-w-[220px] font-mono">{name}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete"
        className="text-red-400 hover:text-red-500 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
