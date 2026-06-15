import { useTerraformStore } from "@/store/useTerraformStore";
import { ResourceBlock } from "./types/resource";
import { evaluateTemplate } from "@/lib/templateEvaluator";
import { awsTemplates } from "@/registry/awsTemplates";

// Perform instant client-side compilation of the node configuration
export async function syncNodeWithBackend(node: ResourceBlock) {
  const reqObj = {
    NodeID: node.id,
    Type: node.type,
    Data: {
      ...node.data,
    },
  };

  if (reqObj.Type === "rectangle") {
    return Promise.resolve();
  }

  const template = awsTemplates[reqObj.Type];
  if (!template) {
    console.warn(`No template found for type: ${reqObj.Type}`);
    return Promise.resolve();
  }

  try {
    // Evaluate the template directly in-memory (0ms latency, zero HTTP calls)
    const block = evaluateTemplate(template, {
      ...reqObj.Data,
      NodeID: reqObj.NodeID,
    });

    const store = useTerraformStore.getState();
    const { terraformBlocks, updateBlock, appendBlocks } = store;

    const blockMap = { [node.id]: block };

    const existingBlock = terraformBlocks[node.id];
    if (existingBlock) {
      updateBlock(node.id, block);
    } else {
      appendBlocks(blockMap);
    }

    console.log("Client-side compiled blocks:", terraformBlocks);
  } catch (error) {
    console.error("Failed to compile node template on client:", error);
    throw error;
  }
}
