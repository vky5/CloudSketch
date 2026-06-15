import { useCallback } from "react";
import { Node, NodeChange } from "@xyflow/react";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { findNonOverlappingPosition } from "@/utils/findNonOverlappingPosition";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";
import { handleContainment } from "@/lib/graphProtocol/ugcp";

export function useCanvasDragAndDrop(
  nodes: Node[],
  setNodes: (changes: NodeChange[]) => void,
  updateNodePosition: (id: string, x: number, y: number) => void,
  updateNodeData: (id: string, newData: Partial<ResourceBlock["data"]>) => void
) {
  // OnNodeChangeHandler
  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      // Process position changes with overlap prevention
      const processedChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          const node = nodes.find((n) => n.id === change.id);

          if (node?.type === "subnet") {
            const subnetVal = node.data as subnetData;
            const parentVpc = nodes.find(
              (n) => n.type === "vpc" && n.id === subnetVal.parentVpcId
            );

            if (parentVpc?.position) {
              // Get VPC bounds - account for node size in collision detection
              const padding = 10;
              const nodeWidth = node.width ?? 160;
              const nodeHeight = node.height ?? 100;
              const vpcBounds = {
                minX: parentVpc.position.x + padding,
                minY: parentVpc.position.y + padding,
                maxX:
                  parentVpc.position.x +
                  (parentVpc.width ?? 200) -
                  nodeWidth -
                  padding,
                maxY:
                  parentVpc.position.y +
                  (parentVpc.height ?? 120) -
                  nodeHeight -
                  padding,
              };

              // Get other subnet nodes in the same VPC
              const otherSubnets = nodes.filter(
                (n) =>
                  n.type === "subnet" &&
                  n.id !== change.id &&
                  (n.data as subnetData).parentVpcId === subnetVal.parentVpcId
              );

              // Find non-overlapping position
              const adjustedPosition = findNonOverlappingPosition(
                node,
                change.position,
                otherSubnets,
                vpcBounds
              );

              return {
                ...change,
                position: adjustedPosition,
              };
            }
          }
        }
        return change;
      });

      setNodes(processedChanges);
    },
    [setNodes, nodes]
  );

  const onNodeDragStart = useCallback(() => {
    console.log("Node drag started");
  }, []);

  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      // Handle subnet nodes constraint checks
      if (node.type === "subnet") {
        const subnetVal = node.data as subnetData;
        const parentVpc = nodes.find(
          (n) => n.type === "vpc" && n.id === subnetVal.parentVpcId
        );
        if (parentVpc?.position) {
          const padding = 10;
          const nodeWidth = node.width ?? 160;
          const nodeHeight = node.height ?? 100;
          const vpcBounds = {
            minX: parentVpc.position.x + padding,
            minY: parentVpc.position.y + padding,
            maxX:
              parentVpc.position.x +
              (parentVpc.width ?? 200) -
              nodeWidth -
              padding,
            maxY:
              parentVpc.position.y +
              (parentVpc.height ?? 120) -
              nodeHeight -
              padding,
          };

          const otherSubnets = nodes.filter(
            (n) =>
              n.type === "subnet" &&
              n.id !== node.id &&
              (n.data as subnetData).parentVpcId === subnetVal.parentVpcId
          );

          const newPos = findNonOverlappingPosition(
            node,
            node.position!,
            otherSubnets,
            vpcBounds
          );

          if (newPos.x !== node.position!.x || newPos.y !== node.position!.y) {
            updateNodePosition(node.id, newPos.x, newPos.y);

            try {
              await syncNodeWithBackend({
                id: node.id,
                type: node.type!,
                data: {
                  ...(node.data as ResourceBlock["data"]),
                },
              });
            } catch (err) {
              console.error("Failed to sync subnet position with backend:", err);
            }
          }
        }
      }

      // Handle UGCP Nesting containment
      if (node.type === "subnet" || node.type === "ec2" || node.type === "rds") {
        if (!node.position) return;

        const containers = nodes.filter((n) => {
          if (node.type === "subnet") return n.type === "vpc";
          return n.type === "subnet";
        });

        const containingNode = containers.find((container) => {
          if (!container.position) return false;

          const cWidth = container.width ?? 200;
          const cHeight = container.height ?? 120;
          const nWidth = node.width ?? 120;
          const nHeight = node.height ?? 80;

          const nLeft = node.position!.x;
          const nRight = node.position!.x + nWidth;
          const nTop = node.position!.y;
          const nBottom = node.position!.y + nHeight;

          const cLeft = container.position.x;
          const cRight = container.position.x + cWidth;
          const cTop = container.position.y;
          const cBottom = container.position.y + cHeight;

          return (
            nLeft >= cLeft &&
            nRight <= cRight &&
            nTop >= cTop &&
            nBottom <= cBottom
          );
        });

        await handleContainment(node, containingNode || null);
      }
    },
    [nodes, updateNodePosition, updateNodeData]
  );

  return {
    onNodesChangeHandler,
    onNodeDragStart,
    onNodeDragStop,
  };
}
