"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { memo, useState } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { FaTrash } from "react-icons/fa6";

function CircleNode({ id, data, selected, width, height }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const w = width || 100;
  const h = height || 100;

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={60}
        keepAspectRatio
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          useDiagramStore
            .getState()
            .updateNodeDimensions(id, width, height);
        }}
      />

      <Handle type="target" position={Position.Top} className="bg-blue-500" />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-blue-500"
      />
      <Handle type="source" position={Position.Left} className="bg-blue-500" />
      <Handle type="source" position={Position.Right} className="bg-blue-500" />

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative border rounded-full bg-[#020817]/75 border-slate-700 shadow text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center"
        style={{
          width: w,
          height: h,
        }}
      >
        {(hovered || selected) && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1 z-50 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Are you sure you want to delete this shape?")) {
                  useDiagramStore.getState().deleteNode(id);
                }
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

export default memo(CircleNode);
