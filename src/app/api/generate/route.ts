import { NextRequest, NextResponse } from "next/server";
import { nodeRegistry } from "@/registry/nodeRegistry";
import { evaluateTemplate } from "@/lib/templateEvaluator";
import path from "path";
import fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { NodeID, Type, Data } = body;

    const metadata = nodeRegistry[Type];
    if (!metadata) {
      return NextResponse.json({ error: "Unknown node type" }, { status: 400 });
    }

    const templateAbsPath = path.join(process.cwd(), metadata.templatePath);
    const templateContent = await fs.readFile(templateAbsPath, "utf-8");

    const tfBlock = evaluateTemplate(templateContent, {
      ...Data,
      NodeID,
    });

    return NextResponse.json({ terraform: tfBlock });
  } catch (error) {
    console.error("Terraform generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate Terraform" },
      { status: 500 }
    );
  }
}
