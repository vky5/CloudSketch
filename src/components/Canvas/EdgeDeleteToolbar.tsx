"use client";

import { useMemo } from "react";
import { useReactFlow, useStore } from "@xyflow/react";
import { Trash2 } from "lucide-react";
import { useDiagramStore } from "@/store/useDiagramStore";
import { getGlobalPosition } from "./useCanvasDragAndDrop";

export default function EdgeDeleteToolbar() {
  const selectedEdgeIds = useDiagramStore((state) => state.selectedEdgeIds);
  const edges = useDiagramStore((state) => state.edges);
  const nodes = useDiagramStore((state) => state.nodes);
  const setEdges = useDiagramStore((state) => state.setEdges);
  const { flowToScreenPosition } = useReactFlow();
  const transform = useStore((state) => state.transform);

  const position = useMemo(() => {
    if (selectedEdgeIds.length !== 1) return null;

    const edge = edges.find((e) => e.id === selectedEdgeIds[0] && e.selected);
    if (!edge) return null;

    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;

    const sourcePos = getGlobalPosition(sourceNode, nodes);
    const targetPos = getGlobalPosition(targetNode, nodes);

    const sourceWidth = sourceNode.width ?? 176;
    const sourceHeight = sourceNode.height ?? 52;
    const targetWidth = targetNode.width ?? 176;
    const targetHeight = targetNode.height ?? 52;

    const midX =
      (sourcePos.x + sourceWidth / 2 + targetPos.x + targetWidth / 2) / 2;
    const midY =
      (sourcePos.y + sourceHeight / 2 + targetPos.y + targetHeight / 2) / 2;

    const screenPos = flowToScreenPosition({ x: midX, y: midY });

    return {
      left: screenPos.x,
      top: screenPos.y - 36,
    };
  }, [selectedEdgeIds, edges, nodes, flowToScreenPosition, transform]);

  if (!position) return null;

  return (
    <div
      className="absolute z-[1002] pointer-events-auto -translate-x-1/2"
      style={{ left: position.left, top: position.top }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setEdges([{ type: "remove", id: selectedEdgeIds[0] }]);
        }}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-950/90 hover:bg-red-900 border border-red-900/50 text-red-300 hover:text-red-200 text-xs font-medium shadow-lg cursor-pointer transition-colors whitespace-nowrap"
        title="Delete connection"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete connection</span>
      </button>
    </div>
  );
}