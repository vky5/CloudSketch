"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaGear } from "react-icons/fa6";
import openSettings from "@/utils/openSettings";
import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";

function SubnetNode({
  data,
  selected,
  id,
  width,
  height,
  // position,
}: AnyNodeProps<subnetData>) {
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        lineClassName="border-green-500"
        handleClassName="bg-green-500 border border-white"
      />

      <div
        className="relative border border-green-400 rounded-md bg-green-900/50 text-xs text-white font-medium"
        style={{
          width: width ?? 160,
          height: height ?? 100,
          minWidth: 120,
          minHeight: 80,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Subnet heading */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
          {data.Name || "Subnet"}
        </div>

        {/* Settings button */}
        {(hovered || selected) && (
          <div className="absolute top-1 right-1 flex gap-1">
            <button
              className="bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow"
              onClick={() => openSettings(id, "node")}
              title="Subnet Settings"
            >
              <FaGear className="w-3.5 h-3.5 text-white hover:text-green-400" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(SubnetNode);