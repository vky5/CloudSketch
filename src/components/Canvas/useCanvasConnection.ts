import { useCallback } from "react";
import { Connection, Edge, Node } from "@xyflow/react";
import canConnect, { keyGen } from "@/config/connectionsConfig";
import connectionLogic, {
  serializeConnectionOrder,
} from "@/lib/nodeConnections/connectionLogicRegistry";
import { ResourceBlock } from "@/utils/types/resource";

export function useCanvasConnection(
  nodes: Node[],
  addEdge: (edge: Edge | Connection) => void
) {
  const onConnect = useCallback(
    async (params: Edge | Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      if (!sourceNode.type || !targetNode.type) {
        console.warn("One of the nodes has no type, skipping connection");
        return;
      }

      // Validate connection first
      if (!canConnect(sourceNode.type, targetNode.type)) {
        alert(`❌ Cannot connect ${sourceNode.type} to ${targetNode.type}`);
        return;
      }

      const sourceBlock: ResourceBlock = {
        id: sourceNode.id,
        type: sourceNode.type,
        data: sourceNode.data as ResourceBlock["data"],
      };

      const targetBlock: ResourceBlock = {
        id: targetNode.id,
        type: targetNode.type,
        data: targetNode.data as ResourceBlock["data"],
      };

      const { source, target } = serializeConnectionOrder(
        sourceBlock,
        targetBlock
      );

      const key = keyGen(source.type, target.type);

      try {
        await connectionLogic(
          key,
          { id: source.id, type: source.type, data: source.data },
          { id: target.id, type: target.type, data: target.data }
        );

        addEdge(params); // only add edge if no error
      } catch (err: unknown) {
        if (err instanceof Error) {
          alert(`❌ ${err.message}`);
        } else {
          alert(`❌ ${err}`);
        }
      }
    },
    [nodes, addEdge]
  );

  return { onConnect };
}
