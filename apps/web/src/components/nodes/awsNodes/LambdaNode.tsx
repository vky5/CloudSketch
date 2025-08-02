import { Handle, Position, NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react"; // Lambda icon
import { useDiagramStore } from "@/store/useDiagramStore";
import { FaGear } from "react-icons/fa6";

export default function LambdaNode({ data,selected ,id }: NodeProps) {
  const openSettings = useDiagramStore((state) => state.openSettings);

  return (
    <div className={`w-full h-full relative border rounded-xl shadow-md bg-[#020817]/75 text-white px-6 py-4 ${selected ? 'border-blue-500' : ''}`}>
        {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Settings Button */}
      <button
        onClick={() => openSettings(id)}
        className="absolute top-2 right-2 transition text-muted-foreground hover:text-white"
        title="Edit Lambda Settings"
      >
        <FaGear className="w-4 h-4" />
      </button>

      {/* Node Content */}
      <div className="flex items-center gap-4">
        <Zap className="w-10 h-10 text-yellow-400" />
        <div className="flex flex-col space-y-1">
          <span className="font-semibold text-base">Lambda Function</span>
          <span className="text-xs text-muted-foreground">
            Runtime: {data.runtime ? data.runtime.toString() : "nodejs18.x"}
          </span>
          <span className="text-xs text-muted-foreground">
            Memory: {typeof data.memory === "string" ? data.memory : "128MB"}
          </span>
        </div>
      </div>
    </div>
  );
}
