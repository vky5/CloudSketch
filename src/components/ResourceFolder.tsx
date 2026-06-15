import { ChevronDown, ChevronRight } from "lucide-react";
import { ReactNode, useState } from "react";

export default function ResourceFolder({
  title,
  icon,
  children,
  onAdd,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  onAdd: () => void;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-2">
      <div
        className="flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 text-gray-300 text-sm font-medium">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
          {icon}
          <span>{title}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          className="text-green-400 hover:text-green-500 transition"
          title={`Add ${title}`}
        >
          +
        </button>
      </div>
      {isOpen && <div className="space-y-1">{children}</div>}
    </div>
  );
}
