import { Handle, Position } from "@xyflow/react";
import { Archive } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear, FaTrash } from "react-icons/fa6";
import { useDiagramStore } from "@/store/useDiagramStore";
import { useEffect, useState } from "react";
import { s3FormConfig, s3Data } from "@/config/awsNodes/s3.config";
import { AnyNodeProps } from "@/utils/types/resource";

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
      className={`w-44 relative rounded-md bg-[#0b0f19] text-white border transition-all duration-150 border-l-4 border-l-green-500
        ${
          selected
            ? "border-indigo-500 shadow-md"
            : isValid
            ? "border-slate-800 hover:border-slate-700"
            : "border-red-500"
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
            title="Edit S3 Settings"
          >
            <FaGear className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              useDiagramStore
                .getState()
                .triggerDeleteConfirmation(id, "Are you sure you want to delete this S3 bucket?");
            }}
            className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
            title="Delete S3"
          >
            <FaTrash className="w-2.5 h-2.5" />
          </button>
        </div>
      )}

      <div className="p-2.5 flex items-center gap-2">
        <Archive className="w-4 h-4 text-green-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-semibold text-[12px] text-slate-100 truncate" title={bucketName}>
            {bucketName}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">S3 Bucket</span>
        </div>
      </div>
    </div>
  );
}
