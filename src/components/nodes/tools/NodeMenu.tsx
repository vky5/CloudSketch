import { NodeToolbar, Position } from "@xyflow/react";
import { FaGear } from "react-icons/fa6";
import { Trash2 } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useShowNodeActions } from "@/utils/useShowNodeActions";

interface NodeMenuProps {
  id: string;
  selected: boolean;
  children?: React.ReactNode;
}

export default function NodeMenu({ id, selected, children }: NodeMenuProps) {
  const deleteNode = useDiagramStore((state) => state.deleteNode);
  const showActions = useShowNodeActions(selected, false);

  return (
    <NodeToolbar
      isVisible={showActions}
      position={Position.Top}
      align="center"
      className="flex items-center gap-1.5 bg-[#18181b] border border-[#27272a] rounded-md p-1 shadow-2xl z-50 pointer-events-auto"
      offset={8}
    >
      {children}
      <button
        onClick={(e) => {
          e.stopPropagation();
          openSettings(id, "node");
        }}
        className="text-[11px] px-2.5 py-1 rounded bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
        title="Settings"
      >
        <FaGear className="w-3 h-3 text-slate-300" />
        <span>Settings</span>
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNode(id);
        }}
        className="text-[11px] px-2.5 py-1 rounded bg-red-950/30 hover:bg-red-900/40 border border-red-900/40 text-red-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
        title="Delete Resource"
      >
        <Trash2 className="w-3 h-3" />
        <span>Delete</span>
      </button>
    </NodeToolbar>
  );
}
