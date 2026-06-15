import React, { forwardRef } from "react";

const GhostCircle = forwardRef<HTMLDivElement, unknown>((props, ref) => {
  return (
    <div
      ref={ref}
      className="absolute border rounded-full bg-[#020817]/50 text-white pointer-events-none w-[80px] h-[80px] flex items-center justify-center text-xs font-semibold opacity-75 z-[1000] overflow-hidden"
    >
      Circle
    </div>
  );
});

GhostCircle.displayName = "GhostCircle";

export default GhostCircle;
