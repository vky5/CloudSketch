import { Handle, Position, NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { ec2Data, ec2FormSchema } from "@/config/awsNodes/ec2.config";
import { AnyNodeProps } from "@/utils/types/resource";

export default function EC2Node({ data, selected, id }: AnyNodeProps<ec2Data>) {
  const [hovered, setHovered] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const instanceType = data.InstanceType?.toString() || "None";
  const amiId = data.AMI?.toString() || "None";

  useEffect(() => {
    const checkNode = () => {
      // find all required fields in schema
      const requiredFields = ec2FormSchema.filter((f) => f.required);

      // check if each required field exists and has a non-empty value
      const missing = requiredFields.filter((field) => {
        const key = field.key as keyof ec2Data; 
        const value = data[key]; // get the actual value from data
        return value === undefined || value === null || value === "";
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
          title="Edit EC2 Settings"
        >
          <FaGear className="w-3.5 h-3.5 hover:text-[#3B82F6] text-white" />
        </button>
      )}

      {/* Node Content */}
      <div className="flex items-center gap-3 mt-1">
        {/* Fixed icon container */}
        <div className="flex-shrink-0">
          <Server className="w-6 h-6 text-[#FF9900]" />
        </div>

        {/* Text container with fixed width + truncation */}
        <div className="flex flex-col space-y-0.5 text-xs min-w-0 max-w-[110px]">
          <span className="font-medium text-sm leading-tight truncate">
            EC2 Instance
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight mt-1">
            Type: {instanceType}
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight">
            AMI: {amiId}
          </span>
        </div>
      </div>
    </div>
  );
}

/*
up until now the ec2 node was completeley unaware of the fields that data will get added with. that the settings will handle
now we will run a loop to check if all fields are filled or not if not filled, make the border red
*/
