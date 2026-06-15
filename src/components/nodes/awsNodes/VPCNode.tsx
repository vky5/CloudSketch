"use client";

import { memo, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaPlus, FaGear } from "react-icons/fa6";
import { Cloud } from "lucide-react";
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
      160,
      100,
      { x: 0, y: 0, width: 5000, height: 5000 }
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
        minWidth={240}
        minHeight={150}
        lineClassName="border-[#6366F1] !border-2"
        handleClassName="bg-[#6366F1] border border-white rounded"
        onResizeEnd={(e, { width, height }) => {
          useDiagramStore.getState().updateNodeDimensions(id, width, height);
        }}
      />

      <div
        className={`relative border-2 rounded-2xl transition-all duration-300 bg-[#04060c]/40 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:32px_32px]
          ${
            selected
              ? "border-[#6366F1] shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              : "border-slate-800/80 hover:border-slate-700/80 shadow-xl"
          }`}
        style={{
          width: width ?? 600,
          height: height ?? 400,
          minWidth: 240,
          minHeight: 150,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Floating Top-Left Tag Badge */}
        <div className="absolute -top-3.5 left-4 bg-[#090b14] border border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-200 flex items-center gap-1.5 shadow-lg select-none pointer-events-auto z-10">
          <Cloud className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-bold text-white max-w-[120px] truncate">{data.Name || "VPC"}</span>
          <span className="text-slate-400 font-mono text-[10px]">{vpcCidr}</span>

          {/* Action Tools */}
          {(hovered || selected) && (
            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5 ml-1.5">
              <button
                className="bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded p-0.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  openSettings(id, "node");
                }}
                title="VPC Settings"
              >
                <FaGear className="w-2.5 h-2.5" />
              </button>

              <button
                className="bg-emerald-950/50 hover:bg-emerald-900/80 border border-emerald-800/80 rounded p-0.5 text-emerald-400 hover:text-white transition-all cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubnet();
                }}
                title="Add Subnet"
              >
                <FaPlus className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(VPCNode);