export type UGCPNodeInput = {
  id?: string;
  type?: string;
  label?: string;
  name?: string;
  x?: number;
  y?: number;
};

export type UGCPEdgeInput = {
  id?: string;
  from?: string;
  source?: string;
  src?: string;
  to?: string;
  target?: string;
  dst?: string;
  label?: string;
  type?: string;
};

export type UGCPGraphInput = {
  nodes?: UGCPNodeInput[];
  edges?: UGCPEdgeInput[];
};

export type UGCPInput = {
  graph?: UGCPGraphInput;
};

export type NormalizedUGCPNode = {
  id: string;
  type: string;
  label: string;
  x?: number;
  y?: number;
};

export type NormalizedUGCPEdge = {
  id: string;
  from: string;
  to: string;
  label: string;
};

export type NormalizedUGCPGraph = {
  nodes: NormalizedUGCPNode[];
  edges: NormalizedUGCPEdge[];
};

export function normalizeUGCPGraph(input: UGCPInput): NormalizedUGCPGraph | null {
  const graph = input?.graph ?? null;
  if (!graph) return null;

  const nodes = Array.isArray(graph.nodes)
    ? graph.nodes.map((n: UGCPNodeInput, idx: number) => ({
        id: n.id || `ai-${idx}-${crypto.randomUUID()}`,
        type: (n.type || "rectangle").toString().toLowerCase(),
        label: n.label || n.name || "",
        x: typeof n.x === "number" ? n.x : undefined,
        y: typeof n.y === "number" ? n.y : undefined,
      }))
    : [];

  const edges = Array.isArray(graph.edges)
    ? graph.edges.map((e: UGCPEdgeInput, idx: number) => ({
        id: e.id || `edge-${idx}-${crypto.randomUUID()}`,
        from: e.from || e.source || e.src || "",
        to: e.to || e.target || e.dst || "",
        label: e.label || e.type || "",
      }))
    : [];

  const validEdges = edges.filter((e) => e.from && e.to);

  return { nodes, edges: validEdges };
}