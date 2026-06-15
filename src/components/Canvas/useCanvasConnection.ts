import { useCallback } from "react";
import { Connection, Edge, Node } from "@xyflow/react";
import canConnect from "@/config/connectionsConfig";
import { handleConnection } from "@/lib/graphProtocol/ugcp";

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

      const edgeId = "id" in params ? params.id : crypto.randomUUID();
      const edgeObj: Edge = {
        ...params,
        id: edgeId,
      } as Edge;

      try {
        const ugcpRes = handleConnection(edgeObj, sourceNode, targetNode);
        if (!ugcpRes.success) {
          alert(`❌ Connection failed: ${ugcpRes.error}`);
          return;
        }

        addEdge(edgeObj); // only add edge if no error
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
