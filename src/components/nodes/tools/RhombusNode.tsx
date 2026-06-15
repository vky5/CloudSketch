"use client";
import { useDiagramStore } from "@/store/useDiagramStore";
import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";

function RhombusNode({ data, selected, width = 100, height = 100 }: NodeProps) {
  // Ensure square dimensions for proper rhombus
  const size = Math.max(width || 100, height || 100);
  
  // Calculate the rotated square size to fit within container
  // For a 45° rotated square, the diagonal becomes the width/height of container
  // So rotated square side = container_size / √2
  const rotatedSize = size / Math.sqrt(2);

  return (
    <div 
      className="relative"
      style={{ 
        width: size, 
        height: size,
        minWidth: 100,
        minHeight: 100 
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={100}
        keepAspectRatio={true} // This maintains square aspect ratio
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          // Use the larger dimension to maintain square
          const newSize = Math.max(width, height);
          useDiagramStore
            .getState()
            .updateNodeDimensions(data.id as string, newSize, newSize);
        }}
      />
      
      {/* Handles positioned at the edges of the container */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="bg-blue-500"
        style={{ top: -4, left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="bg-blue-500"
        style={{ bottom: -4, left: '50%', transform: 'translateX(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        className="bg-blue-500"
        style={{ left: -4, top: '50%', transform: 'translateY(-50%)' }}
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="bg-blue-500"
        style={{ right: -4, top: '50%', transform: 'translateY(-50%)' }}
      />
      
      {/* Rhombus shape - rotated square that fits within container */}
      <div
        className="absolute top-1/2 left-1/2 flex items-center justify-center bg-[#020817]/75 shadow text-sm font-semibold text-white border border-white"
        style={{
          width: rotatedSize,
          height: rotatedSize,
          transform: "translate(-50%, -50%) rotate(45deg)",
          transformOrigin: "center",
        }}
      >
        {/* Text rotated back to be readable */}
        <div 
          className="text-center px-2"
          style={{ 
            transform: "rotate(-45deg)",
            maxWidth: rotatedSize * 0.7, // Ensure text fits within the diamond
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }}
        >
          
        </div>
      </div>
    </div>
  );
}

export default memo(RhombusNode);