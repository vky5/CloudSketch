"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { memo, useState } from "react";
import { NodeProps, NodeResizer } from "@xyflow/react";
import MultiDirectionHandles from "@/components/nodes/shared/MultiDirectionHandles";
import { FaTrash } from "react-icons/fa6";
import { useShowNodeActions } from "@/utils/useShowNodeActions";

function RectangleNode({ id, data, selected, width, height }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const showActions = useShowNodeActions(selected, hovered);
  const w = width || 120;
  const h = height || 60;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={60}
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          useDiagramStore
            .getState()
            .updateNodeDimensions(id, width, height);
        }}
      />

      <MultiDirectionHandles className="!bg-blue-500 !w-2 !h-2" />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative border rounded-md bg-[#020817]/75 border-slate-700 shadow text-sm font-semibold text-white flex items-center justify-center"
        style={{
          width: w,
          height: h,
        }}
      >
        {showActions && (
          <div className="absolute -top-3 -right-3 flex items-center gap-1 z-50 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                useDiagramStore
                  .getState()
                  .triggerDeleteConfirmation(id, "Are you sure you want to delete this shape?");
              }}
              className="bg-slate-900 hover:bg-red-950/80 border border-slate-700 hover:border-red-900/50 rounded-full w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-400 cursor-pointer"
              title="Delete Shape"
            >
              <FaTrash className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default memo(RectangleNode);
