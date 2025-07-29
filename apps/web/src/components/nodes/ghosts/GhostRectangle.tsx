import React, { forwardRef } from "react";

const GhostRectangle = forwardRef<HTMLDivElement, {}>((props, ref) => {
  return (
    <div
      ref={ref}
      className="absolute border rounded-md bg-[#020817]/50 text-white pointer-events-none w-[120px] h-[60px] flex items-center justify-center text-xs font-semibold opacity-75 z-[1000] overflow-hidden"
    >
      Rectangle
    </div>
  );
});

GhostRectangle.displayName = "GhostRectangle";

export default GhostRectangle;
