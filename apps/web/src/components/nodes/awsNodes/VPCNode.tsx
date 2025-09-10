"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { FaPlus, FaGear } from "react-icons/fa6";
import openSettings from "@/utils/openSettings";
import { AnyNodeProps } from "@/utils/types/resource";
import { vpcData } from "@/config/awsNodes/vpc.config";
import { useDiagramStore } from "@/store/useDiagramStore";

function VPCNode({ data, selected, id, width, height }: AnyNodeProps<vpcData>) {
  const [hovered, setHovered] = useState(false);

  //   const onAddSubnet = () => {
  //     openSettings(data.id, "addSubnet"); // Or trigger your subnet form modal
  //   };

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={200}
        minHeight={120}
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          useDiagramStore.getState().updateNodeDimensions(id, width, height);
        }}
      />

      {/* VPC rectangle with padding for resizer */}
      <div
        className="relative border rounded-lg bg-[#020817]/75 shadow text-sm font-semibold text-white"
        style={{
          width: width! - 10,
          height: height! - 10,
          minWidth: 192,
          minHeight: 112,
          margin: "4px",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* VPC heading at top center */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          {data.Name || "VPC"}
        </div>
      </div>

      {(hovered || selected) && (
        <div className="absolute top-1 right-1 flex gap-1">
          <button
            className="bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow"
            onClick={() => openSettings(id, "node")}
            title="VPC Settings"
          >
            <FaGear className="w-3.5 h-3.5 text-white hover:text-[#3B82F6]" />
          </button>

          {/* <button
              className="bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow"
              onClick={onAddSubnet}
              title="Add Subnet"
            >
              <FaPlus className="w-3.5 h-3.5 text-white hover:text-green-500" />
            </button> */}
        </div>
      )}
    </>
  );
}

export default memo(VPCNode);
