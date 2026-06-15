import { useCallback } from "react";
import { Node, NodeChange } from "@xyflow/react";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";
import { handleContainment } from "@/lib/graphProtocol/ugcp";

// Helper to calculate a node's absolute global position on the canvas
export function getGlobalPosition(node: Node, nodes: Node[]): { x: number; y: number } {
  let x = node.position.x;
  let y = node.position.y;
  let parentId = node.parentId;
  while (parentId) {
    const parent = nodes.find((n) => n.id === parentId);
    if (parent) {
      x += parent.position.x;
      y += parent.position.y;
      parentId = parent.parentId;
    } else {
      break;
    }
  }
  return { x, y };
}

export function useCanvasDragAndDrop(
  nodes: Node[],
  setNodes: (changes: NodeChange[]) => void,
  updateNodePosition: (id: string, x: number, y: number) => void,
  updateNodeData: (id: string, newData: Partial<ResourceBlock["data"]>) => void,
  updateNodeParentAndPosition: (id: string, parentId: string | undefined, x: number, y: number) => void
) {
  // onNodesChangeHandler handles real-time position updates
  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      setNodes(changes);
    },
    [setNodes]
  );

  const onNodeDragStart = useCallback(() => {
    console.log("Node drag started");
  }, []);

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      if (node.type === "subnet" || node.type === "ec2" || node.type === "rds") {
        if (!node.position) return;

        // Calculate absolute position on canvas
        const parentNode = node.parentId ? nodes.find((n) => n.id === node.parentId) : null;
        const parentGlobalPos = parentNode ? getGlobalPosition(parentNode, nodes) : { x: 0, y: 0 };
        const nodeGlobalPos = {
          x: parentGlobalPos.x + node.position.x,
          y: parentGlobalPos.y + node.position.y,
        };

        // Find potential container candidates
        const containers = nodes.filter((n) => {
          if (node.type === "subnet") return n.type === "vpc";
          return n.type === "subnet";
        });

        const containingNode = containers.find((container) => {
          const containerGlobalPos = getGlobalPosition(container, nodes);
          const cWidth = container.width ?? 200;
          const cHeight = container.height ?? 120;
          const nWidth = node.width ?? 120;
          const nHeight = node.height ?? 80;

          const nLeft = nodeGlobalPos.x;
          const nRight = nodeGlobalPos.x + nWidth;
          const nTop = nodeGlobalPos.y;
          const nBottom = nodeGlobalPos.y + nHeight;

          const cLeft = containerGlobalPos.x;
          const cRight = containerGlobalPos.x + cWidth;
          const cTop = containerGlobalPos.y;
          const cBottom = containerGlobalPos.y + cHeight;

          return (
            nLeft >= cLeft &&
            nRight <= cRight &&
            nTop >= cTop &&
            nBottom <= cBottom
          );
        });

        if (containingNode) {
          // If entering a new or different parent container
          if (node.parentId !== containingNode.id) {
            const containerGlobalPos = getGlobalPosition(containingNode, nodes);
            const relativeX = nodeGlobalPos.x - containerGlobalPos.x;
            const relativeY = nodeGlobalPos.y - containerGlobalPos.y;

            updateNodeParentAndPosition(node.id, containingNode.id, relativeX, relativeY);

            const nodeWithNewParent = {
              ...node,
              parentId: containingNode.id,
              position: { x: relativeX, y: relativeY },
            };
            await handleContainment(nodeWithNewParent, containingNode);
          } else {
            // Moved within the same parent
            try {
              await syncNodeWithBackend({
                id: node.id,
                type: node.type!,
                data: {
                  ...(node.data as ResourceBlock["data"]),
                },
              });
            } catch (err) {
              console.error("Failed to sync nested node position with backend:", err);
            }
          }
        } else {
          // Exited parent or is placed on the empty canvas
          if (node.parentId) {
            updateNodeParentAndPosition(node.id, undefined, nodeGlobalPos.x, nodeGlobalPos.y);

            const nodeWithNoParent = {
              ...node,
              parentId: undefined,
              position: nodeGlobalPos,
            };
            await handleContainment(nodeWithNoParent, null);
          } else {
            // Free floating node position update sync
            try {
              await syncNodeWithBackend({
                id: node.id,
                type: node.type!,
                data: {
                  ...(node.data as ResourceBlock["data"]),
                },
              });
            } catch (err) {
              console.error("Failed to sync free-floating node position with backend:", err);
            }
          }
        }
      }
    },
    [nodes, updateNodeParentAndPosition]
  );

  return {
    onNodesChangeHandler,
    onNodeDragStart,
    onNodeDragStop,
  };
}
