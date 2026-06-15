import { Handle, Position, NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { FaGear } from "react-icons/fa6";
import { useState } from "react";

export default function LambdaNode({ data, selected, id }: NodeProps) {
  const openSettings = useDiagramStore((state) => state.openSettings);
  const [hovered, setHovered] = useState(false);

  const runtime = data.runtime?.toString() || "nodejs18.x";
  const memory = typeof data.memory === "string" ? data.memory : "128MB";

  return (
    <div
      className={`min-w-[160px] max-w-[180px] relative border rounded-lg shadow bg-[#020817]/75 text-white px-3  py-1.5 ${
        selected ? "border-blue-500" : "border-sidebar-border"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Floating Gear on Hover - Just Outside Top-Right */}
      {(hovered || selected) && (
        <button
          onClick={() => openSettings(id)}
          className={`absolute -top-3 -right-3 bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow transition-opacity duration-200 ${
            hovered || selected ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          title="Edit Lambda Settings"
        >
          <FaGear className="w-3.5 h-3.5 hover:text-[#3B82F6] text-white" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3 mt-1">
        <Zap className="w-6 h-6 text-[#F29100]" />
        <div className="flex flex-col space-y-0.5 text-xs">
          <span className="font-medium text-sm leading-tight truncate">
            Lambda Function
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight mt-1">
            Runtime: {runtime}
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight">
            Memory: {memory}
          </span>
        </div>
      </div>
    </div>
  );
}
