import { NextResponse } from "next/server";
import { normalizeUGCPGraph, type UGCPInput } from "@/lib/ai/parseUGCP";

/**
 * AI Prompt route
 * - If `GROQ_API_URL` and `GROQ_API_KEY` are set in the environment, this will proxy the prompt
 *   to that provider and expect a response in JSON containing a `graph` object.
 * - Otherwise the route falls back to a mocked response useful for local testing.
 *
 * Environment variables (set in your .env):
 * GROQ_API_URL - full endpoint to call (e.g. https://api.groq.ai/v1)
 * GROQ_API_KEY - API key for authorization
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body?.prompt ?? "";

    const GROQ_API_URL = process.env.GROQ_API_URL;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    // If provider not configured, return a mock graph for local testing
    if (!GROQ_API_URL || !GROQ_API_KEY) {
      const mock = {
        message: `Mock response generated for prompt: ${prompt}`,
        graph: {
          nodes: [
            { id: "vpc1", type: "vpc", label: "Production VPC", x: 100, y: 50 },
            { id: "subnet1", type: "subnet", label: "Public Subnet", x: 120, y: 110 },
            { id: "ec2_1", type: "ec2", label: "Web Server (t2.micro)", x: 140, y: 160 },
            { id: "rds_1", type: "rds", label: "PostgreSQL DB", x: 250, y: 160 },
            { id: "ebs_1", type: "ebs", label: "Data Volume", x: 760, y: 100 },
            { id: "s3_1", type: "s3", label: "Assets Bucket", x: 760, y: 260 },
          ],
          edges: [
            { id: "edge_ec2_rds", from: "ec2_1", to: "rds_1", label: "connects" },
            { id: "edge_ec2_ebs", from: "ec2_1", to: "ebs_1", label: "attaches" },
            { id: "edge_ec2_s3", from: "ec2_1", to: "s3_1", label: "accesses" },
          ],
        },
      };

      return NextResponse.json(mock);
    }

    // Build provider request: ask for UGCP-first structured output
    const providerPayload = {
      prompt: `Produce a JSON object in UGCP (internal graph language) describing nodes and edges for the following user requirement. Only return valid JSON.\n\nRequirement:\n${prompt}\n\nReturn schema: { graph: { nodes:[{id,type,label,x,y}], edges:[{from,to,label}] } }`,
      format: "json",
      output_schema: "ugcp_graph",
    };

    const resp = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify(providerPayload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("Groq provider error:", resp.status, text);
      return NextResponse.json({ error: "AI provider error" }, { status: 502 });
    }

    const text = await resp.text();

    // Try parse as JSON; some providers return plain text with JSON inside
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Attempt to extract JSON substring
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error("Failed to parse provider response as JSON", e2);
        }
      }
    }

    // If parsed contains a graph, normalize and return it. Otherwise include full parsed result.
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed !== null &&
      "graph" in parsed
    ) {
      try {
        const normalized = normalizeUGCPGraph(parsed as UGCPInput);
        if (normalized) return NextResponse.json({ message: "OK", graph: normalized });
      } catch (e) {
        console.error("UGCP normalization failed", e);
      }
    }

    // If provider returned something unexpected, forward as message for debugging
    return NextResponse.json({ message: text, raw: parsed });
  } catch (err) {
    console.error("AI prompt route error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
