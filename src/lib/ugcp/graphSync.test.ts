import { describe, it, expect } from "vitest";
import { Edge } from "@xyflow/react";
import { AnyNode } from "@/utils/types/resource";
import { toUGCPGraph, validateUGCPGraph } from "./graphSync";

const projectMeta = { id: "proj-1", name: "Test Project" };

function makeNode(overrides: Partial<AnyNode> = {}): AnyNode {
  return {
    id: "node-1",
    type: "ec2",
    position: { x: 100, y: 200 },
    data: { Name: "web-server" },
    ...overrides,
  } as AnyNode;
}

function makeEdge(overrides: Partial<Edge> = {}): Edge {
  return {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    ...overrides,
  } as Edge;
}

describe("toUGCPGraph", () => {
  it("maps nodes with id, type, position, and data", () => {
    const graph = toUGCPGraph([makeNode()], [], projectMeta);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0]).toMatchObject({
      id: "node-1",
      type: "ec2",
      position: { x: 100, y: 200 },
      data: { Name: "web-server" },
    });
  });

  it("carries project metadata", () => {
    const graph = toUGCPGraph([], [], {
      ...projectMeta,
      description: "desc",
      tags: ["aws"],
    });

    expect(graph.projectId).toBe("proj-1");
    expect(graph.metadata).toEqual({
      name: "Test Project",
      description: "desc",
      tags: ["aws"],
    });
  });

  it("defaults provenance to human/anonymous for nodes without one", () => {
    const graph = toUGCPGraph([makeNode()], [], projectMeta);

    expect(graph.nodes[0].provenance.source).toBe("human");
    expect(graph.nodes[0].provenance.createdBy).toBe("anonymous");
    expect(graph.nodes[0].provenance.overrides).toEqual([]);
  });

  it("preserves existing provenance carried in node data", () => {
    const node = makeNode({
      data: {
        Name: "web-server",
        provenance: {
          source: "ai",
          createdAt: "2026-01-01T00:00:00.000Z",
          createdBy: "user-42",
          rationale: "Generated from prompt",
        },
      },
    } as Partial<AnyNode>);

    const graph = toUGCPGraph([node], [], projectMeta);

    expect(graph.nodes[0].provenance).toMatchObject({
      source: "ai",
      createdAt: "2026-01-01T00:00:00.000Z",
      createdBy: "user-42",
      rationale: "Generated from prompt",
    });
  });

  it("strips the provenance copy out of node data", () => {
    const node = makeNode({
      data: { Name: "web-server", provenance: { source: "ai" } },
    } as Partial<AnyNode>);

    const graph = toUGCPGraph([node], [], projectMeta);

    expect(graph.nodes[0].data).not.toHaveProperty("provenance");
    expect(graph.nodes[0].data).toHaveProperty("Name", "web-server");
  });

  it("normalizes missing parentId and dimensions to null", () => {
    const graph = toUGCPGraph([makeNode()], [], projectMeta);

    expect(graph.nodes[0].parentId).toBeNull();
    expect(graph.nodes[0].width).toBeNull();
    expect(graph.nodes[0].height).toBeNull();
  });

  it("keeps parentId and dimensions when present", () => {
    const node = makeNode({ parentId: "vpc-1", width: 300, height: 150 });
    const graph = toUGCPGraph([node], [], projectMeta);

    expect(graph.nodes[0].parentId).toBe("vpc-1");
    expect(graph.nodes[0].width).toBe(300);
    expect(graph.nodes[0].height).toBe(150);
  });

  it("maps edges and defaults their type to connection", () => {
    const graph = toUGCPGraph([], [makeEdge()], projectMeta);

    expect(graph.edges[0]).toMatchObject({
      id: "edge-1",
      source: "node-1",
      target: "node-2",
      type: "connection",
    });
  });

  it("leaves edge provenance undefined when the edge has none", () => {
    const graph = toUGCPGraph([], [makeEdge()], projectMeta);
    expect(graph.edges[0].provenance).toBeUndefined();
  });

  it("produces a graph that passes its own schema validation", () => {
    const graph = toUGCPGraph(
      [makeNode(), makeNode({ id: "node-2", type: "subnet", parentId: "node-1" })],
      [makeEdge()],
      projectMeta
    );

    const result = validateUGCPGraph(graph);
    expect(result.success).toBe(true);
  });
});

describe("validateUGCPGraph", () => {
  it("rejects a graph missing required fields", () => {
    const result = validateUGCPGraph({ nodes: [], edges: [] });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("projectId");
    }
  });

  it("rejects nodes without a position", () => {
    const graph = toUGCPGraph([makeNode()], [], projectMeta);
    const broken = {
      ...graph,
      nodes: [{ ...graph.nodes[0], position: undefined }],
    };

    const result = validateUGCPGraph(broken);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid provenance source", () => {
    const graph = toUGCPGraph([makeNode()], [], projectMeta);
    const broken = {
      ...graph,
      nodes: [
        {
          ...graph.nodes[0],
          provenance: { ...graph.nodes[0].provenance, source: "alien" },
        },
      ],
    };

    const result = validateUGCPGraph(broken);
    expect(result.success).toBe(false);
  });

  it("accepts a minimal valid graph", () => {
    const result = validateUGCPGraph({
      projectId: "p",
      version: 1,
      updatedAt: Date.now(),
      nodes: [],
      edges: [],
      metadata: { name: "n", tags: [] },
    });

    expect(result.success).toBe(true);
  });
});
