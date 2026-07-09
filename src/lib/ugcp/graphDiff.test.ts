import { describe, it, expect } from "vitest";
import { UGCPGraph, UGCPNode, UGCPEdge } from "@/models/ugcp/schema";
import { diffUGCPGraphs } from "./graphDiff";

const provenance = {
  source: "human" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: "anonymous",
  rationale: "test",
  overrides: [],
};

function makeNode(overrides: Partial<UGCPNode> = {}): UGCPNode {
  return {
    id: "node-1",
    type: "ec2",
    parentId: null,
    position: { x: 0, y: 0 },
    width: null,
    height: null,
    data: {},
    provenance,
    ...overrides,
  };
}

function makeEdge(overrides: Partial<UGCPEdge> = {}): UGCPEdge {
  return {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    type: "connection",
    data: {},
    ...overrides,
  };
}

function makeGraph(nodes: UGCPNode[], edges: UGCPEdge[] = []): UGCPGraph {
  return {
    projectId: "p",
    version: 1,
    updatedAt: 0,
    nodes,
    edges,
    metadata: { name: "n", tags: [] },
  };
}

describe("diffUGCPGraphs", () => {
  it("reports no changes for identical graphs", () => {
    const graph = makeGraph([makeNode()], [makeEdge()]);
    const diff = diffUGCPGraphs(graph, graph);

    expect(diff.addedNodes).toEqual([]);
    expect(diff.deletedNodes).toEqual([]);
    expect(diff.modifiedNodes).toEqual([]);
    expect(diff.addedEdges).toEqual([]);
    expect(diff.deletedEdges).toEqual([]);
    expect(diff.modifiedEdges).toEqual([]);
  });

  it("detects added nodes", () => {
    const prev = makeGraph([makeNode()]);
    const next = makeGraph([makeNode(), makeNode({ id: "node-2" })]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.addedNodes.map((n) => n.id)).toEqual(["node-2"]);
    expect(diff.deletedNodes).toEqual([]);
  });

  it("detects deleted nodes", () => {
    const prev = makeGraph([makeNode(), makeNode({ id: "node-2" })]);
    const next = makeGraph([makeNode()]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.deletedNodes.map((n) => n.id)).toEqual(["node-2"]);
  });

  it("detects a position change", () => {
    const prev = makeGraph([makeNode()]);
    const next = makeGraph([makeNode({ position: { x: 50, y: 60 } })]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.modifiedNodes).toHaveLength(1);
    expect(diff.modifiedNodes[0].changes).toEqual([
      {
        field: "position",
        oldValue: { x: 0, y: 0 },
        newValue: { x: 50, y: 60 },
      },
    ]);
  });

  it("detects a reparenting change", () => {
    const prev = makeGraph([makeNode()]);
    const next = makeGraph([makeNode({ parentId: "subnet-1" })]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.modifiedNodes[0].changes).toContainEqual({
      field: "parentId",
      oldValue: null,
      newValue: "subnet-1",
    });
  });

  it("detects a data change", () => {
    const prev = makeGraph([makeNode({ data: { Name: "old" } })]);
    const next = makeGraph([makeNode({ data: { Name: "new" } })]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.modifiedNodes[0].changes).toContainEqual({
      field: "data",
      oldValue: { Name: "old" },
      newValue: { Name: "new" },
    });
  });

  it("collects multiple field changes on one node", () => {
    const prev = makeGraph([makeNode()]);
    const next = makeGraph([
      makeNode({ position: { x: 1, y: 1 }, width: 300, height: 200 }),
    ]);

    const diff = diffUGCPGraphs(prev, next);
    const fields = diff.modifiedNodes[0].changes.map((c) => c.field);
    expect(fields).toEqual(
      expect.arrayContaining(["position", "width", "height"])
    );
  });

  it("detects added and deleted edges", () => {
    const prev = makeGraph([], [makeEdge()]);
    const next = makeGraph([], [makeEdge({ id: "edge-2", target: "node-3" })]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.addedEdges.map((e) => e.id)).toEqual(["edge-2"]);
    expect(diff.deletedEdges.map((e) => e.id)).toEqual(["edge-1"]);
  });

  it("detects an edge retarget", () => {
    const prev = makeGraph([], [makeEdge()]);
    const next = makeGraph([], [makeEdge({ target: "node-9" })]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.modifiedEdges).toHaveLength(1);
    expect(diff.modifiedEdges[0].changes).toContainEqual({
      field: "target",
      oldValue: "node-2",
      newValue: "node-9",
    });
  });

  it("ignores provenance-only differences on nodes", () => {
    const prev = makeGraph([makeNode()]);
    const next = makeGraph([
      makeNode({ provenance: { ...provenance, createdBy: "someone-else" } }),
    ]);

    const diff = diffUGCPGraphs(prev, next);
    expect(diff.modifiedNodes).toEqual([]);
  });
});
