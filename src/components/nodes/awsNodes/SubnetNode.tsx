"use client";

import { memo, useEffect, useRef, useState } from "react";
import { NodeResizer } from "@xyflow/react";
import { FaGear, FaPlus, FaTrash } from "react-icons/fa6";
import { Database, Repeat, Server } from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import openSettings from "@/utils/openSettings";
import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { useShowNodeActions } from "@/utils/useShowNodeActions";
import { addSubnetChild, SubnetChildType } from "@/utils/addSubnetChild";

const SUBNET_CHILD_OPTIONS: {
  type: SubnetChildType;
  label: string;
  icon: typeof Server;
  color: string;
}[] = [
  { type: "ec2", label: "EC2 Instance", icon: Server, color: "text-amber-400" },
  { type: "rds", label: "RDS Database", icon: Database, color: "text-blue-400" },
  { type: "elb", label: "Load Balancer", icon: Repeat, color: "text-sky-400" },
];

function SubnetNode({
  data,
  selected,
  id,
  width,
  height,
}: AnyNodeProps<subnetData>) {
  const [hovered, setHovered] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const showActions = useShowNodeActions(selected, hovered);
  const subnetCidr = data.CIDR?.toString() || "10.0.1.0/24";

  useEffect(() => {
    if (!showAddMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as HTMLElement)) {
        setShowAddMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showAddMenu]);

  const handleAddChild = async (childType: SubnetChildType) => {
    setShowAddMenu(false);
    try {
      await addSubnetChild(id, childType);
    } catch (error) {
      console.error(`Failed to add ${childType} to subnet:`, error);
    }
  };

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
        <div
          className="absolute top-2 left-2 text-[11px] text-slate-400 font-medium select-none flex items-center gap-1.5 pointer-events-auto cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            const store = useDiagramStore.getState();
            if (store.selectedTool === "hand") {
              store.handOffToSelectNode(id);
            } else {
              store.selectedNode(id);
            }
          }}
        >
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

              <div className="relative" ref={addMenuRef}>
                <button
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded-full w-5 h-5 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddMenu((open) => !open);
                  }}
                  title="Add resource to subnet"
                >
                  <FaPlus className="w-2.5 h-2.5" />
                </button>

                {showAddMenu && (
                  <div className="absolute left-0 top-6 z-50 min-w-[168px] rounded-lg border border-slate-700 bg-[#131316] py-1 shadow-xl">
                    {SUBNET_CHILD_OPTIONS.map((option) => (
                      <button
                        key={option.type}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-[11px] text-slate-200 hover:bg-slate-800 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleAddChild(option.type);
                        }}
                      >
                        <option.icon className={`w-3.5 h-3.5 ${option.color}`} />
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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