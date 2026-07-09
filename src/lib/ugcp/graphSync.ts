import { Edge } from "@xyflow/react";
import { AnyNode } from "@/utils/types/resource";
import { UGCPGraph, UGCPGraphSchema, UGCPNode, UGCPEdge, UGCPProvenance } from "@/models/ugcp/schema";

type PartialProvenance = Partial<UGCPProvenance> | null | undefined;

/**
 * Maps React Flow nodes and edges to the canonical validated UGCPGraph structure
 */
export function toUGCPGraph(
  nodes: AnyNode[],
  edges: Edge[],
  projectMeta: { id: string; name: string; description?: string; tags?: string[] }
): UGCPGraph {
  const ugcpNodes: UGCPNode[] = nodes.map((node) => {
    // Check if the node carries an existing provenance record
    const existingProvenance: PartialProvenance = node.data && typeof node.data === "object" && "provenance" in node.data
      ? (node.data as { provenance: PartialProvenance }).provenance
      : null;

    const provenance = {
      source: existingProvenance?.source ?? "human",
      createdAt: existingProvenance?.createdAt ?? new Date().toISOString(),
      createdBy: existingProvenance?.createdBy ?? "anonymous",
      rationale: existingProvenance?.rationale ?? `Visual node of type ${node.type} created on the canvas`,
      requirementRef: existingProvenance?.requirementRef ?? null,
      patternRef: existingProvenance?.patternRef ?? null,
      promptRef: existingProvenance?.promptRef ?? null,
      overrides: existingProvenance?.overrides ?? [],
    };

    // Copy data attributes but strip out the internal provenance copy to keep it clean
    const cleanData: Record<string, unknown> = { ...node.data };
    delete cleanData.provenance;

    return {
      id: node.id,
      type: node.type ?? "unknown",
      parentId: node.parentId ?? null,
      position: {
        x: node.position.x,
        y: node.position.y,
      },
      width: node.width ?? null,
      height: node.height ?? null,
      data: cleanData,
      provenance,
    };
  });

  const ugcpEdges: UGCPEdge[] = edges.map((edge) => {
    const existingProvenance: PartialProvenance = edge.data && typeof edge.data === "object" && "provenance" in edge.data
      ? (edge.data as { provenance: PartialProvenance }).provenance
      : null;

    const provenance = existingProvenance
      ? {
          source: existingProvenance.source ?? "human",
          createdAt: existingProvenance.createdAt ?? new Date().toISOString(),
          createdBy: existingProvenance.createdBy ?? "anonymous",
          rationale: existingProvenance.rationale ?? "Visual connection created on the canvas",
          requirementRef: existingProvenance.requirementRef ?? null,
          patternRef: existingProvenance.patternRef ?? null,
          promptRef: existingProvenance.promptRef ?? null,
          overrides: existingProvenance.overrides ?? [],
        }
      : undefined;

    const cleanData: Record<string, unknown> = edge.data ? { ...edge.data } : {};
    delete cleanData.provenance;

    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type ?? "connection",
      data: cleanData,
      provenance,
    };
  });

  return {
    projectId: projectMeta.id,
    version: 1,
    updatedAt: Date.now(),
    nodes: ugcpNodes,
    edges: ugcpEdges,
    metadata: {
      name: projectMeta.name,
      description: projectMeta.description ?? "",
      tags: projectMeta.tags ?? [],
    },
  };
}

/**
 * Validates any arbitrary graph object against the UGCPGraph schema rules
 */
export function validateUGCPGraph(
  graph: unknown
): { success: true; data: UGCPGraph } | { success: false; error: string } {
  const result = UGCPGraphSchema.safeParse(graph);
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  // Format errors into a readable summary string
  const formattedError = result.error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
    
  return { success: false, error: formattedError };
}
