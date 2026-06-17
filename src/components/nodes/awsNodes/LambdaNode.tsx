import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear, FaTrash } from "react-icons/fa6";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useState } from "react";
import { AnyNodeProps } from "@/utils/types/resource";

export default function LambdaNode({ data, selected, id }: AnyNodeProps<any>) {
  const [hovered, setHovered] = useState(false);

  const runtime = data.runtime?.toString() || "nodejs18.x";

  return (
    <div
      className={`w-44 relative rounded-md bg-[#0b0f19] text-white border transition-all duration-150 border-l-4 border-l-red-500
        ${
          selected
            ? "border-indigo-500 shadow-md"
            : "border-slate-800 hover:border-slate-700"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-700 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-700 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Left} className="!bg-slate-700 !w-1.5 !h-1.5" />
      <Handle type="source" position={Position.Right} className="!bg-slate-700 !w-1.5 !h-1.5" />

      {(hovered || selected) && (
        <div className="absolute -top-2.5 right-1.5 flex items-center gap-1 z-50 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openSettings(id, "node");
            }}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            title="Edit Lambda Settings"
          >
            <FaGear className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              useDiagramStore
                .getState()
                .triggerDeleteConfirmation(id, "Are you sure you want to delete this Lambda function?");
            }}
            className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
            title="Delete Lambda"
          >
            <FaTrash className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <div className="p-2.5 flex items-center gap-2">
        <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-semibold text-[12px] text-slate-100 truncate" title={data.Name || "Lambda Function"}>
            {data.Name || "Lambda Function"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">{runtime}</span>
        </div>
      </div>
    </div>
  );
}
