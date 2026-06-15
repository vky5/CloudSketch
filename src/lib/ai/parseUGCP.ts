export function normalizeUGCPGraph(input: any) {
  const graph = input?.graph ?? null;
  if (!graph) return null;

  const nodes = Array.isArray(graph.nodes)
    ? graph.nodes.map((n: any, idx: number) => ({
        id: n.id || `ai-${idx}-${crypto.randomUUID()}`,
        type: (n.type || "rectangle").toString().toLowerCase(),
        label: n.label || n.name || "",
        x: typeof n.x === "number" ? n.x : undefined,
        y: typeof n.y === "number" ? n.y : undefined,
      }))
    : [];

  const edges = Array.isArray(graph.edges)
    ? graph.edges.map((e: any, idx: number) => ({
        id: e.id || `edge-${idx}-${crypto.randomUUID()}`,
        from: e.from || e.source || e.src,
        to: e.to || e.target || e.dst,
        label: e.label || e.type || "",
      }))
    : [];

  // Filter out invalid edges
  const validEdges = edges.filter((e: any) => e.from && e.to);

  return { nodes, edges: validEdges };
}
