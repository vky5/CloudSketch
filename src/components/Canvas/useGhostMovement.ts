import { useEffect, useRef } from "react";

export function useGhostMovement(
  selectedTool: string,
  ghostRef: React.RefObject<HTMLDivElement | null>
) {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const moveGhost = () => {
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.left = `${mousePos.current.x}px`;
        ghost.style.top = `${mousePos.current.y}px`;
      }
      requestAnimationFrame(moveGhost);
    };

    window.addEventListener("mousemove", updatePosition);
    requestAnimationFrame(moveGhost);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, [ghostRef]);
}
