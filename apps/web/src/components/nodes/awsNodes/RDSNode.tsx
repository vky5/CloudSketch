import { Handle, Position, NodeProps } from "@xyflow/react";
import { Database } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { rdsFormSchema } from "@/config/awsNodes/rds.config";

export default function RDSNode({ data, selected, id }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const engine = data.Engine?.toString() || "MySQL";
  const instanceClass = data.InstanceClass?.toString() || "db.t3.micro";

  // Check required fields for validity
  useEffect(() => {
    const requiredFields = rdsFormSchema.filter((f) => f.required);
    const missing = requiredFields.filter((field) => {
      const value = data[field.key];
      return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
    });
    setIsValid(missing.length === 0);
  }, [data]);

  return (
    <div
      className={`min-w-[160px] max-w-[180px] relative border rounded-lg shadow bg-[#020817]/75 text-white px-3 py-1.5 
        ${
          selected
            ? "border-blue-500"
            : isValid
            ? "border-sidebar-border"
            : "border-red-500"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {/* Floating Gear Button - Hover/Selected */}
      {(hovered || selected) && (
        <button
          onClick={() => openSettings(id, "node")}
          className={`absolute -top-3 -right-3 bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow transition-opacity duration-200 ${
            hovered || selected ? "opacity-100 scale-100" : "opacity-0 scale-90"
          }`}
          title="Edit RDS Settings"
        >
          <FaGear className="w-3.5 h-3.5 hover:text-[#3B82F6] text-white" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3 mt-1">
        <Database className="w-6 h-6 text-[#527FFF]" /> {/* AWS RDS Blue */}
        <div className="flex flex-col space-y-0.5 text-xs min-w-0">
          <span className="font-medium text-sm leading-tight truncate">
            RDS Instance
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight mt-1">
            Engine: {engine}
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight">
            Size: {instanceClass}
          </span>
        </div>
      </div>
    </div>
  );
}
