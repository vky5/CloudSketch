"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";

function CircleNode({ data, selected, width, height }: NodeProps) {
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
            .updateNodeDimensions(data.id as string, width, height);
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

      {/* Node visual — circular container */}
      <div
        className="w-full h-full flex items-center justify-center border rounded-full bg-[#020817]/75 shadow text-sm font-semibold text-white transition-all duration-200"
        style={{
          width: width! - 10,
          height: height! - 10,
          minWidth: 60,
          minHeight: 60,
          margin: "4px",
        }}
      >
        {/* Visual content / optional label */}
      </div>
    </>
  );
}

export default memo(CircleNode);
