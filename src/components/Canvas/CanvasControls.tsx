"use client";

import { useReactFlow, useStore } from "@xyflow/react";
import { Crosshair, Minus, Plus } from "lucide-react";

export default function CanvasControls() {
  const { zoomIn, zoomOut, setCenter } = useReactFlow();
  const maxZoomReached = useStore(
    (state) => state.transform[2] >= state.maxZoom
  );
  const minZoomReached = useStore(
    (state) => state.transform[2] <= state.minZoom
  );

  const handleCenter = () => {
    setCenter(0, 0, { zoom: 1, duration: 250 });
  };

  const buttonClass =
    "flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:bg-slate-800/80 hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400";

  return (
    <div className="pointer-events-auto absolute bottom-4 right-4 z-10 flex flex-row overflow-hidden rounded-lg border border-slate-800/70 bg-[#0f1219] shadow-lg">
      <button
        type="button"
        onClick={() => zoomIn({ duration: 200 })}
        disabled={maxZoomReached}
        className={`${buttonClass} border-r border-slate-800/70`}
        title="Zoom in"
        aria-label="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleCenter}
        className={`${buttonClass} border-r border-slate-800/70`}
        title="Center canvas"
        aria-label="Center canvas"
      >
        <Crosshair className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={() => zoomOut({ duration: 200 })}
        disabled={minZoomReached}
        className={buttonClass}
        title="Zoom out"
        aria-label="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}