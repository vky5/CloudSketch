import { Handle, Position, useNodeId, useUpdateNodeInternals } from "@xyflow/react";
import { CSSProperties, useEffect } from "react";

const SIDES = [
  { position: Position.Top, id: "top" },
  { position: Position.Right, id: "right" },
  { position: Position.Bottom, id: "bottom" },
  { position: Position.Left, id: "left" },
] as const;

const handleClass =
  "!bg-slate-500 !w-2.5 !h-2.5 !border !border-slate-600";

interface MultiDirectionHandlesProps {
  className?: string;
  style?: CSSProperties;
}

export default function MultiDirectionHandles({
  className = handleClass,
  style,
}: MultiDirectionHandlesProps) {
  const nodeId = useNodeId();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    if (!nodeId) return;
    const frame = requestAnimationFrame(() => updateNodeInternals(nodeId));
    return () => cancelAnimationFrame(frame);
  }, [nodeId, updateNodeInternals]);

  return (
    <>
      {SIDES.flatMap(({ position, id }) => [
        <Handle
          key={`${id}-source`}
          type="source"
          position={position}
          id={id}
          className={className}
          style={style}
        />,
        <Handle
          key={`${id}-target`}
          type="target"
          position={position}
          id={id}
          className={`${className} !opacity-0 !pointer-events-none`}
          style={style}
        />,
      ])}
    </>
  );
}