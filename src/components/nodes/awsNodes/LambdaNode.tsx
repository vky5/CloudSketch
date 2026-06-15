import { Handle, Position } from "@xyflow/react";
import { Zap } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { FaGear } from "react-icons/fa6";
import { useState } from "react";
import { AnyNodeProps } from "@/utils/types/resource";

export default function LambdaNode({ data, selected, id }: AnyNodeProps<any>) {
  const [hovered, setHovered] = useState(false);

  const runtime = data.runtime?.toString() || "nodejs18.x";
  const memory = typeof data.memory === "string" ? data.memory : "128MB";

  return (
    <div
      className={`w-52 relative rounded-xl bg-[#090b14]/90 backdrop-blur-md text-white border transition-all duration-300
        ${
          selected
            ? "border-[#6366F1] shadow-[0_0_15px_rgba(99,102,241,0.3)] scale-[1.01]"
            : "border-slate-800/80 shadow-lg hover:border-slate-700/80"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange-600 to-red-500 rounded-t-xl" />

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
          title="Edit Lambda Settings"
        >
          <FaGear className="w-3 h-3" />
        </button>
      )}

      {/* Node Content */}
      <div className="px-3.5 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <div className="bg-red-500/10 text-red-400 p-1.5 rounded-lg border border-red-500/15">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs tracking-wider text-slate-400 uppercase">Serverless</span>
            <span className="font-bold text-[13px] text-white truncate max-w-[120px]" title={data.Name || "Lambda Function"}>
              {data.Name || "Lambda Function"}
            </span>
          </div>
        </div>

        <div className="border-b border-slate-800/60 my-1" />

        <div className="flex flex-col gap-1 text-[10px]">
          <div className="flex justify-between items-center text-slate-400">
            <span>Runtime</span>
            <span className="font-mono text-slate-200 font-semibold truncate max-w-[90px]">{runtime}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Memory</span>
            <span className="font-mono text-slate-200 truncate max-w-[90px]">{memory}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
