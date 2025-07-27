'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export default function RectangleNode({ data }: NodeProps) {
  return (
    <div className=" bg-[#020817]/75 border border-sidebar-border text-sidebar-foreground rounded-md shadow-md p-4 w-[120px] h-[80px] relative flex items-center justify-center">
      {/* Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <span className="text-sm font-semibold">
        {data.label || 'Rectangle'}
      </span>
    </div>
  );
}
