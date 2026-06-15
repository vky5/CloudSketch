import { Handle, Position } from "@xyflow/react";
import { HardDrive } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { ebsData, ebsFormSchema } from "@/config/awsNodes/ebs.config";
import { AnyNodeProps } from "@/utils/types/resource";

export default function EBSNode({ data, selected, id }: AnyNodeProps<ebsData>) {
  const [hovered, setHovered] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const volumeType = data.VolumeType?.toString() || "None";
  const size = data.Size?.toString() || "None";

  useEffect(() => {
    const checkNode = () => {
      // find all required fields in schema
      const requiredFields = ebsFormSchema.filter((f) => f.required);

      // check if each required field exists and has a non-empty value
      const missing = requiredFields.filter((field) => {
        const key = field.key as keyof ebsData; // key is "VolumeType" | "Size"
        const value = data[key]; // get the actual value from data

        return (
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0)
        );
      });

      setIsValid(missing.length === 0);
    };

    checkNode();
  }, [data]);

  return (
    <div
      className={`w-[180px] relative border rounded-lg shadow bg-[#020817]/75 text-white px-3 py-1.5 
        ${
          selected
            ? "border-blue-500"
            : isValid
            ? "border-white"
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
          title="Edit EBS Settings"
        >
          <FaGear className="w-3.5 h-3.5 hover:text-[#3B82F6] text-white" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3 mt-1">
        {/* Fixed icon container */}
        <div className="flex-shrink-0">
          <HardDrive className="w-6 h-6 text-[#6A5ACD]" />
        </div>

        {/* Text container with fixed width + truncation */}
        <div className="flex flex-col space-y-0.5 text-xs min-w-0 max-w-[110px]">
          <span className="font-medium text-sm leading-tight truncate">
            EBS Volume
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight mt-1">
            Type: {volumeType}
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight">
            Size: {size} GiB
          </span>
        </div>
      </div>
    </div>
  );
}

/*
This EBSNode mirrors EC2Node:
- Pulls schema from ebsFormSchema
- Red border if required fields missing
- Shows VolumeType + Size
- Hover/selected gear button opens settings
*/
