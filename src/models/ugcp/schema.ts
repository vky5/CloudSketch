import { z } from "zod";

// Provenance tracks the design intent and creation origin of resources
export const UGCPProvenanceSchema = z.object({
  source: z.enum(["ai", "human", "import", "template"]).default("human"),
  createdAt: z.string().datetime().default(() => new Date().toISOString()),
  createdBy: z.string().default("anonymous"),
  rationale: z.string().default("Created visually on the canvas"),
  requirementRef: z.string().url().optional().nullable(),
  patternRef: z.string().optional().nullable(),
  promptRef: z.string().optional().nullable(),
  overrides: z.array(
    z.object({
      timestamp: z.string().datetime(),
      field: z.string(),
      oldValue: z.any(),
      newValue: z.any(),
      reason: z.string(),
    })
  ).default([]),
});

// A Node represents an AWS resource with position, structure, and configuration settings
export const UGCPNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  parentId: z.string().optional().nullable(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  data: z.record(z.string(), z.any()),
  provenance: UGCPProvenanceSchema,
});

// An Edge represents the logical connection lines between AWS resources (e.g. EC2 target attachments)
export const UGCPEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
  provenance: UGCPProvenanceSchema.optional(),
});

// The root Graph represents the canonical cloud architecture configuration
export const UGCPGraphSchema = z.object({
  projectId: z.string(),
  version: z.number().int().nonnegative().default(1),
  updatedAt: z.number().int(),
  nodes: z.array(UGCPNodeSchema),
  edges: z.array(UGCPEdgeSchema),
  metadata: z.object({
    name: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

// TypeScript type inference exports
export type UGCPProvenance = z.infer<typeof UGCPProvenanceSchema>;
export type UGCPNode = z.infer<typeof UGCPNodeSchema>;
export type UGCPEdge = z.infer<typeof UGCPEdgeSchema>;
export type UGCPGraph = z.infer<typeof UGCPGraphSchema>;
