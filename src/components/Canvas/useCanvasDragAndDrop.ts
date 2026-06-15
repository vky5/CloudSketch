import { useCallback } from "react";
import { Node, NodeChange } from "@xyflow/react";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { findNonOverlappingPosition } from "@/utils/findNonOverlappingPosition";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";

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
      // Handle subnet nodes (existing logic)
      if (node.type === "subnet") {
        const subnetVal = node.data as subnetData;
        const parentVpc = nodes.find(
          (n) => n.type === "vpc" && n.id === subnetVal.parentVpcId
        );
        if (!parentVpc?.position) return;

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
          // 1. Update local store
          updateNodePosition(node.id, newPos.x, newPos.y);

          // 2. Sync with backend
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

      // Handle EC2/RDS nodes being dropped into subnets
      else if (node.type === "ec2" || node.type === "rds") {
        if (!node.position) return;

        // Find all subnet nodes
        const subnetNodes = nodes.filter((n) => n.type === "subnet");

        // Check which subnet (if any) contains the dropped node
        const containingSubnet = subnetNodes.find((subnet) => {
          if (!subnet.position) return false;

          const subnetWidth = subnet.width ?? 160;
          const subnetHeight = subnet.height ?? 100;
          const nodeWidth = node.width ?? 100;
          const nodeHeight = node.height ?? 80;

          // Check if the node is completely within the subnet bounds
          const nodeLeft = node.position!.x;
          const nodeRight = node.position!.x + nodeWidth;
          const nodeTop = node.position!.y;
          const nodeBottom = node.position!.y + nodeHeight;

          const subnetLeft = subnet.position.x;
          const subnetRight = subnet.position.x + subnetWidth;
          const subnetTop = subnet.position.y;
          const subnetBottom = subnet.position.y + subnetHeight;

          return (
            nodeLeft >= subnetLeft &&
            nodeRight <= subnetRight &&
            nodeTop >= subnetTop &&
            nodeBottom <= subnetBottom
          );
        });

        if (containingSubnet) {
          // Update the node data with the subnet ID
          const updatedData = {
            ...node.data,
            SubnetID: containingSubnet.id,
          };

          // Update the node in the store
          updateNodeData(
            node.id,
            updatedData as Partial<ResourceBlock["data"]>
          );

          // Sync with backend
          try {
            await syncNodeWithBackend({
              id: node.id,
              type: node.type!,
              data: updatedData as unknown as ResourceBlock["data"],
            });

            console.log(
              `${node.type} node ${node.id} assigned to subnet ${containingSubnet.id}`
            );
          } catch (err) {
            console.error(
              `Failed to sync ${node.type} node with backend:`,
              err
            );
          }
        } else {
          // If the node is not in any subnet, clear the subnet ID
          if (node.data?.subnetId) {
            const updatedData = {
              ...node.data,
              subnetId: undefined,
            };

            updateNodeData(
              node.id,
              updatedData as Partial<ResourceBlock["data"]>
            );

            try {
              await syncNodeWithBackend({
                id: node.id,
                type: node.type!,
                data: updatedData as unknown as ResourceBlock["data"],
              });

              console.log(`${node.type} node ${node.id} removed from subnet`);
            } catch (err) {
              console.error(
                `Failed to sync ${node.type} node with backend:`,
                err
              );
            }
          }
        }
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
