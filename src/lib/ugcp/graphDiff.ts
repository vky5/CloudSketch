import { UGCPGraph, UGCPNode, UGCPEdge } from "@/models/ugcp/schema";

export interface NodeDiff {
  id: string;
  type: string;
  changes: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
}

export interface EdgeDiff {
  id: string;
  changes: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
}

export interface GraphDiffResult {
  addedNodes: UGCPNode[];
  deletedNodes: UGCPNode[];
  modifiedNodes: NodeDiff[];
  addedEdges: UGCPEdge[];
  deletedEdges: UGCPEdge[];
  modifiedEdges: EdgeDiff[];
}

/**
 * Computes the difference between two UGCPGraph versions
 */
export function diffUGCPGraphs(prev: UGCPGraph, next: UGCPGraph): GraphDiffResult {
  const prevNodesMap = new Map(prev.nodes.map((n) => [n.id, n]));
  const nextNodesMap = new Map(next.nodes.map((n) => [n.id, n]));

  const prevEdgesMap = new Map(prev.edges.map((e) => [e.id, e]));
  const nextEdgesMap = new Map(next.edges.map((e) => [e.id, e]));

  const addedNodes: UGCPNode[] = [];
  const deletedNodes: UGCPNode[] = [];
  const modifiedNodes: NodeDiff[] = [];

  const addedEdges: UGCPEdge[] = [];
  const deletedEdges: UGCPEdge[] = [];
  const modifiedEdges: EdgeDiff[] = [];

  // 1. Process Nodes
  next.nodes.forEach((nextNode) => {
    const prevNode = prevNodesMap.get(nextNode.id);
    if (!prevNode) {
      addedNodes.push(nextNode);
    } else {
      const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];

      if (prevNode.type !== nextNode.type) {
        changes.push({ field: "type", oldValue: prevNode.type, newValue: nextNode.type });
      }
      if (prevNode.parentId !== nextNode.parentId) {
        changes.push({ field: "parentId", oldValue: prevNode.parentId, newValue: nextNode.parentId });
      }
      if (prevNode.position.x !== nextNode.position.x || prevNode.position.y !== nextNode.position.y) {
        changes.push({
          field: "position",
          oldValue: { x: prevNode.position.x, y: prevNode.position.y },
          newValue: { x: nextNode.position.x, y: nextNode.position.y },
        });
      }
      if (prevNode.width !== nextNode.width) {
        changes.push({ field: "width", oldValue: prevNode.width, newValue: nextNode.width });
      }
      if (prevNode.height !== nextNode.height) {
        changes.push({ field: "height", oldValue: prevNode.height, newValue: nextNode.height });
      }

      // Compare configuration data attributes
      const prevDataStr = JSON.stringify(prevNode.data);
      const nextDataStr = JSON.stringify(nextNode.data);
      if (prevDataStr !== nextDataStr) {
        changes.push({ field: "data", oldValue: prevNode.data, newValue: nextNode.data });
      }

      if (changes.length > 0) {
        modifiedNodes.push({
          id: nextNode.id,
          type: nextNode.type,
          changes,
        });
      }
    }
  });

  prev.nodes.forEach((prevNode) => {
    if (!nextNodesMap.has(prevNode.id)) {
      deletedNodes.push(prevNode);
    }
  });

  // 2. Process Edges
  next.edges.forEach((nextEdge) => {
    const prevEdge = prevEdgesMap.get(nextEdge.id);
    if (!prevEdge) {
      addedEdges.push(nextEdge);
    } else {
      const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];

      if (prevEdge.source !== nextEdge.source) {
        changes.push({ field: "source", oldValue: prevEdge.source, newValue: nextEdge.source });
      }
      if (prevEdge.target !== nextEdge.target) {
        changes.push({ field: "target", oldValue: prevEdge.target, newValue: nextEdge.target });
      }
      if (prevEdge.type !== nextEdge.type) {
        changes.push({ field: "type", oldValue: prevEdge.type, newValue: nextEdge.type });
      }

      const prevDataStr = JSON.stringify(prevEdge.data);
      const nextDataStr = JSON.stringify(nextEdge.data);
      if (prevDataStr !== nextDataStr) {
        changes.push({ field: "data", oldValue: prevEdge.data, newValue: nextEdge.data });
      }

      if (changes.length > 0) {
        modifiedEdges.push({
          id: nextEdge.id,
          changes,
        });
      }
    }
  });

  prev.edges.forEach((prevEdge) => {
    if (!nextEdgesMap.has(prevEdge.id)) {
      deletedEdges.push(prevEdge);
    }
  });

  return {
    addedNodes,
    deletedNodes,
    modifiedNodes,
    addedEdges,
    deletedEdges,
    modifiedEdges,
  };
}
