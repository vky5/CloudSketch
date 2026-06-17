"use client";

import { useDiagramStore } from "@/store/useDiagramStore";
import { memo, useState } from "react";
import { Handle, Position, NodeProps, NodeResizer } from "@xyflow/react";
import { FaTrash } from "react-icons/fa6";

function RhombusNode({ id, data, selected, width, height }: NodeProps) {
  const [hovered, setHovered] = useState(false);
  const w = width || 100;
  const h = height || 100;
  const size = Math.max(w, h);
  
  // Calculate the rotated square size to fit within container
  // For a 45° rotated square, the diagonal becomes the width/height of container
  // So rotated square side = container_size / √2
  const rotatedSize = size / Math.sqrt(2);

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={100}
        keepAspectRatio={true} // This maintains square aspect ratio
        lineClassName="border-blue-500"
        handleClassName="bg-blue-500 border border-white"
        onResizeEnd={(e, { width, height }) => {
          const newSize = Math.max(width, height);
          useDiagramStore
            .getState()
            .updateNodeDimensions(id, newSize, newSize);
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

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative"
        style={{ 
          width: size, 
          height: size,
        }}
      >
        {(hovered || selected) && (
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
        
        {/* Rhombus shape - rotated square that fits within container */}
        <div
          className="absolute top-1/2 left-1/2 flex items-center justify-center bg-[#020817]/75 shadow text-sm font-semibold text-white border border-slate-700"
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
          />
        </div>
      </div>
    </>
  );
}

export default memo(RhombusNode);