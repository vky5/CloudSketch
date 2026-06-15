import { Handle, Position } from "@xyflow/react";
import { Archive } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear } from "react-icons/fa6";
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
      className={`w-52 relative rounded-xl bg-[#090b14]/90 backdrop-blur-md text-white border transition-all duration-300
        ${
          selected
            ? "border-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.01]"
            : isValid
            ? "border-slate-800/80 shadow-lg hover:border-slate-700/80"
            : "border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-emerald-400 rounded-t-xl" />

      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} className="!bg-slate-700 !w-2 !h-2" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-700 !w-2 !h-2" />
      <Handle type="source" position={Position.Left} className="!bg-slate-700 !w-2 !h-2" />
      <Handle type="source" position={Position.Right} className="!bg-slate-700 !w-2 !h-2" />

      {/* Floating Gear Button */}
      {(hovered || selected) && (
        <button
          onClick={() => openSettings(id, "node")}
          className="absolute -top-3.5 right-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-md p-1 shadow-md hover:scale-105 transition-all text-slate-300 hover:text-white z-50 cursor-pointer"
          title="Edit S3 Settings"
        >
          <FaGear className="w-3 h-3" />
        </button>
      )}

      {/* Node Content */}
      <div className="px-3.5 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg border border-emerald-500/15">
            <Archive className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs tracking-wider text-slate-400 uppercase">Object Storage</span>
            <span className="font-bold text-[13px] text-white truncate max-w-[120px]" title={bucketName}>
              {bucketName}
            </span>
          </div>
        </div>

        <div className="border-b border-slate-800/60 my-1" />

        <div className="flex flex-col gap-1 text-[10px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>Bucket Name</span>
            <span className="font-mono text-slate-200 truncate max-w-[100px]" title={bucketName}>{bucketName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
