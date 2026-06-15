"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaGear } from "react-icons/fa6";
import { Network } from "lucide-react";
import openSettings from "@/utils/openSettings";
import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";

function SubnetNode({
  data,
  selected,
  id,
  width,
  height,
}: AnyNodeProps<subnetData>) {
  const [hovered, setHovered] = useState(false);
  const subnetCidr = data.CIDR?.toString() || "10.0.1.0/24";

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={100}
        lineClassName="border-[#10B981] !border-2"
        handleClassName="bg-[#10B981] border border-white rounded"
      />

      <div
        className={`relative border-2 border-dashed rounded-xl transition-all duration-300
          ${
            selected
              ? "border-[#10B981] bg-[#10B981]/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "border-emerald-500/30 hover:border-emerald-500/50 bg-emerald-500/[0.03]"
          }`}
        style={{
          width: width ?? 260,
          height: height ?? 180,
          minWidth: 160,
          minHeight: 100,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Floating Top-Left Tag Badge */}
        <div className="absolute -top-3.5 left-3 bg-[#090b14] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 flex items-center gap-1.5 shadow-lg select-none pointer-events-auto">
          <Network className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-bold text-white max-w-[100px] truncate">{data.Name || "Subnet"}</span>
          <span className="text-slate-400 font-mono text-[10px]">{subnetCidr}</span>

          {/* Inline Settings Trigger */}
          {(hovered || selected) && (
            <button
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded p-0.5 text-slate-400 hover:text-white transition-all ml-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openSettings(id, "node");
              }}
              title="Subnet Settings"
            >
              <FaGear className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(SubnetNode);