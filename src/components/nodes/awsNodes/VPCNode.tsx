"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaPlus, FaGear, FaTrash } from "react-icons/fa6";
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
  const vpcCidr = data.CIDR?.toString() || "10.0.0.0/16";

  const handleAddSubnet = async () => {
    const subnetId = crypto.randomUUID();

    const parentVpcNode = nodes.find((n) => n.id === id);
    if (!parentVpcNode) return;

    const existingSubnets = nodes.filter(
      (n) => n.type === "subnet" && (n.data as subnetData).parentVpcId === id
    ) as AnyNodeProps<subnetData>[];

    const parentVpcNodeProps: AnyNodeProps<vpcData> = {
      ...parentVpcNode,
      isConnectable: true,
      positionAbsoluteX: parentVpcNode.position.x,
      positionAbsoluteY: parentVpcNode.position.y,
    } as AnyNodeProps<vpcData>;

    const pos = getNextSubnetPosition(
      parentVpcNodeProps,
      existingSubnets,
      260,
      180,
      { x: 0, y: 0, width: 5000, height: 5000 }
    );

    const newSubnet = {
      id: subnetId,
      type: "subnet",
      position: pos,
      parentId: id,
      data: {
        uuid: subnetId,
        parentVpcId: id,
        Name: "New Subnet",
        CIDR: "10.0.1.0/24",
      },
      width: 260,
      height: 180,
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
        lineClassName="border-slate-500"
        handleClassName="bg-slate-700 border border-white rounded"
        onResizeEnd={(e, { width, height }) => {
          useDiagramStore.getState().updateNodeDimensions(id, width, height);
        }}
      />

      <div
        className={`relative border rounded-xl transition-all duration-150 bg-transparent
          ${
            selected
              ? "border-blue-500 border-2"
              : "border-slate-800 hover:border-slate-700"
          }`}
        style={{
          width: width ?? 600,
          height: height ?? 400,
          minWidth: 200,
          minHeight: 120,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Simple inline title */}
        <div className="absolute top-2 left-3 text-[11px] text-slate-400 font-medium select-none flex items-center gap-1.5 pointer-events-auto z-10">
          <span className="text-blue-500 font-bold">VPC:</span>
          <span className="text-slate-200">{data.Name || "Production"}</span>
          <span className="font-mono text-[10px] opacity-75">({vpcCidr})</span>

          {(hovered || selected) && (
            <div className="flex items-center gap-1 ml-1.5">
              <button
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openSettings(id, "node");
                }}
                title="VPC Settings"
              >
                <FaGear className="w-2.5 h-2.5" />
              </button>

              <button
                className="bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubnet();
                }}
                title="Add Subnet"
              >
                <FaPlus className="w-2.5 h-2.5" />
              </button>

              <button
                className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  useDiagramStore
                    .getState()
                    .triggerDeleteConfirmation(
                      id,
                      "Are you sure you want to delete this VPC? Deleting the VPC will also delete everything inside it (subnets, EC2 instances, databases, etc.)."
                    );
                }}
                title="Delete VPC"
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

export default memo(VPCNode);