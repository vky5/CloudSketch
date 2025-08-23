import axios from "axios";
import { useTerraformStore } from "@/store/useTerraformStore";
import { ResourceBlock } from "./types/resource";

// Fixed version using getState() — no hooks outside components
export async function syncNodeWithBackend(node: ResourceBlock) {
  const reqObj = {
    NodeID: node.id, // so we are passing the normal id as NodeId
    Type: node.type,
    Data: {
      ...node.data, // Spread operator to include all data properties
    }
  }

  const store = useTerraformStore.getState(); 
  const { terraformBlocks, updateBlock, appendBlocks } = store;

  try {
    const res = await axios.post(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/generate",
      reqObj,
    );

    const block = res.data.terraform;
    const blockMap = { [node.id]: block };

    const existingBlock = terraformBlocks[node.id];
    if (existingBlock) {
      updateBlock(node.id, block);
    } else {
      appendBlocks(blockMap);
    }

    console.log("terraformBlocks", terraformBlocks);
  } catch (error) {
    console.error("Failed to sync node with backend", error);
    throw error; // Let caller handle failure (optional)
  }
}
