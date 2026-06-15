import { Handle, Position } from "@xyflow/react";
import { Archive } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { s3FormConfig, s3Data } from "@/config/awsNodes/s3.config";
import { AnyNodeProps } from "@/utils/types/resource";

// Use NodeProps<s3Data> so TS knows data matches s3Data
export default function S3Node({ data, selected, id }: AnyNodeProps<s3Data>) {
  const [hovered, setHovered] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const bucketName = data.Name || "my-bucket";

  useEffect(() => {
    const requiredFields = s3FormConfig.filter((f) => f.required);

    const missing = requiredFields.filter((field) => {
      const value = data[field.key as keyof s3Data];
      return value === undefined || value === null || value === "";
    });

    setIsValid(missing.length === 0);
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
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {(hovered || selected) && (
        <button
          onClick={() => openSettings(id, "node")}
          className="absolute -top-3 -right-3 bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow transition-opacity duration-200"
          title="Edit S3 Settings"
        >
          <FaGear className="w-3.5 h-3.5 hover:text-[#3B82F6] text-white" />
        </button>
      )}

      <div className="flex items-center gap-3 mt-1">
        <div className="flex-shrink-0">
          <Archive className="w-6 h-6 text-[#FF4F00]" />
        </div>

        <div className="flex flex-col space-y-0.5 text-xs min-w-0 max-w-[150px]">
          <span className="font-medium text-sm leading-tight truncate">
            S3 Bucket
          </span>
          <span className="text-muted-foreground text-[11px] truncate leading-tight">
            Name: {bucketName}
          </span>
        </div>
      </div>
    </div>
  );
}
