import React, { forwardRef } from "react";

const GhostRhombus = forwardRef<HTMLDivElement, {}>((props, ref) => {
  const size = 100;
  const rotatedSize = size / Math.sqrt(2);

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none z-[1000]"
      style={{
        width: size,
        height: size,
        minWidth: 100,
        minHeight: 100,
      }}
    >
      <div
        className="absolute top-1/2 left-1/2 flex items-center justify-center bg-[#020817]/50 text-white border border-white opacity-75 overflow-hidden"
        style={{
          width: rotatedSize,
          height: rotatedSize,
          transform: "translate(-50%, -50%) rotate(45deg)",
          transformOrigin: "center",
        }}
      >
        <div
          className="text-xs font-semibold text-center px-2"
          style={{
            transform: "rotate(-45deg)",
            maxWidth: rotatedSize * 0.7,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          Rhombus
        </div>
      </div>
    </div>
  );
});

GhostRhombus.displayName = "GhostRhombus";

export default GhostRhombus;
