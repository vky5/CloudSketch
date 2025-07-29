import { Handle, Position, NodeProps } from  '@xyflow/react';
import { Server } from "lucide-react"; 
import { useDiagramStore } from "@/store/useDiagramStore";
import { FaGear } from "react-icons/fa6";

export default function EC2Node({ data, id }: NodeProps) {
  const openSettings = useDiagramStore((state) => state.openSettings);

  return (
    <div className="bg-[#0E0F11] border border-sidebar-border text-sidebar-foreground rounded-xl shadow-md p-4 min-w-[240px] relative">
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Settings Button */}
      <button
        onClick={() => openSettings(id)}
        className="absolute top-2 right-2 transition text-muted-foreground hover:text-white"
        title="Edit EC2 Settings"
      >
        <FaGear className="w-4 h-4" />
      </button>

      {/* Node Content */}
      <div className="flex items-center gap-4">
        <Server className="w-10 h-10 text-chart-5" />
        <div className="flex flex-col space-y-1">
          <span className="font-semibold text-base">EC2 Instance</span>
          <span className="text-xs text-muted-foreground">
            {`Type: ${data.instanceType || "t2.micro"}`}
          </span>
          <span className="text-xs text-muted-foreground">
            AMI: {data.amiId ? data.amiId.toString() : "ami-12345678"}
          </span>
        </div>
      </div>
    </div>
  );
}
