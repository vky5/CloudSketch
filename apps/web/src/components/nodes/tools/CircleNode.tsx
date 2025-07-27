'use client';

import { Handle, Position, NodeProps } from 'reactflow';

export default function CircleNode({ data }: NodeProps) {
  return (
    <div className="relative w-[100px] h-[100px] rounded-full bg-[#0E0F11] border border-sidebar-border text-sidebar-foreground shadow-md flex items-center justify-center">
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      <span className="text-sm font-semibold pointer-events-none">
        {data.label || 'Circle'}
      </span>
    </div>
  );
}
