import { Edge } from "@xyflow/react";

export function areNodesAlreadyConnected(
  edges: Edge[],
  sourceId: string,
  targetId: string
): boolean {
  return edges.some(
    (edge) =>
      (edge.source === sourceId && edge.target === targetId) ||
      (edge.source === targetId && edge.target === sourceId)
  );
}