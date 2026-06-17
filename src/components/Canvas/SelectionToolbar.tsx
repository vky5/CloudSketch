"use client";

import { useMemo } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";

export default function SelectionToolbar() {
  const selectedNodeIds = useDiagramStore((state) => state.selectedNodeIds);
  const nodes = useDiagramStore((state) => state.nodes);
  const deleteNodes = useDiagramStore((state) => state.deleteNodes);
  const { getNodesBounds, flowToScreenPosition } = useReactFlow();
  const transform = useStore((state) => state.transform);

  const position = useMemo(() => {
    if (selectedNodeIds.length <= 1) return null;

    const selectedNodes = nodes.filter(
      (node) => node.selected && selectedNodeIds.includes(node.id)
    );
    if (selectedNodes.length === 0) return null;

    const bounds = getNodesBounds(selectedNodes);
    const topRight = flowToScreenPosition({
      x: bounds.x + bounds.width,
      y: bounds.y,
    });

    return {
      left: topRight.x + 8,
      top: topRight.y - 36,
    };
  }, [selectedNodeIds, nodes, getNodesBounds, flowToScreenPosition, transform]);

  if (!position) return null;

  return (
    <div
      className="absolute z-[1002] pointer-events-auto"
      style={{ left: position.left, top: position.top }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          deleteNodes(selectedNodeIds);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-950/90 hover:bg-red-900 border border-red-900/50 text-red-300 hover:text-red-200 text-xs font-medium shadow-lg cursor-pointer transition-colors"
        title={`Delete ${selectedNodeIds.length} selected items`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete ({selectedNodeIds.length})</span>
      </button>
    </div>
  );
}