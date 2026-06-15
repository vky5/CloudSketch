import { useEffect } from "react";
import { Node } from "@xyflow/react";

export function useCanvasSelection(
  selectedTool: string,
  nodes: Node[],
  selectNodes: (ids: string[]) => void,
  canvasRef: React.RefObject<HTMLDivElement | null>,
  selectionBoxRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (selectedTool !== "select") return;

    const canvas = canvasRef.current;
    const selectionBox = selectionBoxRef.current;
    if (!canvas || !selectionBox) return;

    let isSelecting = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = "0px";
      selectionBox.style.height = "0px";
      selectionBox.style.display = "block";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const rectLeft = Math.min(startX, currentX);
      const rectTop = Math.min(startY, currentY);
      const rectWidth = Math.abs(startX - currentX);
      const rectHeight = Math.abs(startY - currentY);

      selectionBox.style.left = `${rectLeft}px`;
      selectionBox.style.top = `${rectTop}px`;
      selectionBox.style.width = `${rectWidth}px`;
      selectionBox.style.height = `${rectHeight}px`;
    };

    const onMouseUp = () => {
      isSelecting = false;
      selectionBox.style.display = "none";

      const selectionRect = selectionBox.getBoundingClientRect();

      // Compute selected nodes
      const selected = nodes.filter((node) => {
        const nodeRect = document
          .querySelector(`[data-id='${node.id}']`)
          ?.getBoundingClientRect();
        if (!nodeRect) return false;

        const isInside =
          nodeRect.left >= selectionRect.left &&
          nodeRect.right <= selectionRect.right &&
          nodeRect.top >= selectionRect.top &&
          nodeRect.bottom <= selectionRect.bottom;

        return isInside;
      });

      const selectedIds = selected.map((node) => node.id);
      selectNodes(selectedIds);
      console.log("Selected node IDs:", selectedIds);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [selectedTool, nodes, selectNodes, canvasRef, selectionBoxRef]);
}
