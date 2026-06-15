"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaPlus, FaGear } from "react-icons/fa6";
import openSettings from "@/utils/openSettings";
import { AnyNodeProps } from "@/utils/types/resource";
import { vpcData } from "@/config/awsNodes/vpc.config";
import { useDiagramStore } from "@/store/useDiagramStore";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { getNextSubnetPosition } from "@/utils/getNextSubnetPosition";
import { syncNodeWithBackend } from "@/utils/terraformSync";

function VPCNode({
  data,
  selected,
  id,
  width,
  height,
}: AnyNodeProps<vpcData>) {
  const [hovered, setHovered] = useState(false);
  const { nodes, addNode } = useDiagramStore();

  const handleAddSubnet = async () => {
    const subnetId = crypto.randomUUID();

    const parentVpcNode = nodes.find((n) => n.id === id);
    if (!parentVpcNode) return;

    const existingSubnets = nodes.filter(
      (n) => n.type === "subnet" && (n.data as subnetData).parentVpcId === id
    ) as AnyNodeProps<subnetData>[];

    // ✅ Correct position calculation inside VPC
    const parentVpcNodeProps: AnyNodeProps<vpcData> = {
      ...parentVpcNode,
      isConnectable: true,
      positionAbsoluteX: parentVpcNode.position.x,
      positionAbsoluteY: parentVpcNode.position.y,
    } as AnyNodeProps<vpcData>;

    const pos = getNextSubnetPosition(
      parentVpcNodeProps,
      existingSubnets,
      160, // subnet width
      100, // subnet height
      { x: 0, y: 0, width: 5000, height: 5000 } // canvas bounds
    );

    const newSubnet = {
      id: subnetId,
      type: "subnet",
      position: pos,
      data: {
        uuid: subnetId,
        parentVpcId: id,
        Name: "New Subnet",
        CIDR: "10.0.1.0/24",
      },
      width: 160,
      height: 100,
      dragging: false,
      zIndex: 0,
      selectable: true,
      deletable: true,
      selected: false,
      draggable: true,
    };

    try {
      await syncNodeWithBackend({
        id: subnetId,
        type: "subnet",
        data: newSubnet.data,
      });
      addNode(newSubnet);
    } catch (error) {
      console.warn(error);
    }
  };

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

      {/* VPC rectangle */}
      <div
        className="relative border rounded-lg bg-[#020817]/75 shadow text-sm font-semibold text-white"
        style={{
          width: (width ?? 200) - 10,
          height: (height ?? 120) - 10,
          minWidth: 192,
          minHeight: 112,
          margin: 4,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
          {data.Name || "VPC"}
        </div>
      </div>

      {(hovered || selected) && (
        <div className="absolute top-1 right-1 flex gap-1">
          {/* Settings */}
          <button
            className="bg-[#111827] hover:bg-[#1f2937] border border-gray-600 rounded-full p-1 shadow"
            onClick={() => openSettings(id, "node")}
            title="VPC Settings"
          >
            <FaGear className="w-3.5 h-3.5 text-white hover:text-[#3B82F6]" />
          </button>

          {/* Add Subnet */}
          <button
            className="bg-green-800 hover:bg-green-700 border border-green-600 rounded-full p-1 shadow"
            onClick={handleAddSubnet}
            title="Add Subnet"
          >
            <FaPlus className="w-3.5 h-3.5 text-white hover:text-green-400" />
          </button>
        </div>
      )}
    </>
  );
}

export default memo(VPCNode);