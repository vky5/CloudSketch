"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaGear, FaTrash } from "react-icons/fa6";
import { useDiagramStore } from "@/store/useDiagramStore";
import openSettings from "@/utils/openSettings";
import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { useShowNodeActions } from "@/utils/useShowNodeActions";

function SubnetNode({
  data,
  selected,
  id,
  width,
  height,
}: AnyNodeProps<subnetData>) {
  const [hovered, setHovered] = useState(false);
  const showActions = useShowNodeActions(selected, hovered);
  const subnetCidr = data.CIDR?.toString() || "10.0.1.0/24";

  const isPublic = data.MapPublicIpOnLaunch === "yes";
  const subnetColor = isPublic ? "#10B981" : "#3B82F6"; // Emerald for public, Blue for private
  const subnetLabel = isPublic ? "PUBLIC" : "PRIVATE";

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        lineClassName="border-slate-500"
        handleClassName="bg-slate-700 border border-white rounded"
      />

      <div
        className="relative border rounded-lg transition-all duration-155 bg-transparent"
        style={{
          width: width ?? 260,
          height: height ?? 180,
          minWidth: 120,
          minHeight: 80,
          borderColor: selected ? subnetColor : "#1e293b",
          borderWidth: selected ? 2 : 1,
          borderStyle: isPublic ? "dashed" : "solid",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Simple inline title */}
        <div className="absolute top-2 left-2 text-[11px] text-slate-400 font-medium select-none flex items-center gap-1.5 pointer-events-auto">
          <span style={{ color: subnetColor }} className="font-bold">SUBNET ({subnetLabel}):</span>
          <span className="text-slate-200">{data.Name || "Subnet"}</span>
          <span className="font-mono text-[10px] opacity-75">({subnetCidr})</span>

          {showActions && (
            <div className="flex items-center gap-1 ml-1.5">
              <button
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openSettings(id, "node");
                }}
                title="Subnet Settings"
              >
                <FaGear className="w-2.5 h-2.5" />
              </button>
              <button
                className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  useDiagramStore
                    .getState()
                    .triggerDeleteConfirmation(
                      id,
                      "Are you sure you want to delete this Subnet? Deleting the Subnet will also delete everything inside it."
                    );
                }}
                title="Delete Subnet"
              >
                <FaTrash className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(SubnetNode);