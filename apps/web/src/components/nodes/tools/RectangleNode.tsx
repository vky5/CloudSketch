"use client";

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "reactflow";

function RectangleNode({ data, selected }: NodeProps) {
  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={60}
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
      />

      <Handle type="target" position={Position.Top} className="bg-blue-500" />
      <Handle type="source" position={Position.Bottom} className="bg-blue-500" />
      <Handle type="source" position={Position.Left} className="bg-blue-500" />
      <Handle type="source" position={Position.Right} className="bg-blue-500" />

      {/* Node visual — flush with resizer border */}
      <div
        className="w-full h-full flex items-center justify-center border rounded-md bg-[#020817]/75 shadow text-sm font-semibold text-white"
        style={{ minWidth: 120, minHeight: 60 }}
      >
        {data.label || "Rectangle"}
      </div>
    </>
  );
}

export default memo(RectangleNode);
