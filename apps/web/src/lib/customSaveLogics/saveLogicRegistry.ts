import { defaultSave } from "@/utils/defaultSave";
import { ResourceBlock } from "@/utils/types/resource";
import { rdsSave } from "./rdsSaveHandle";

const saveHandlers: Record<string, (node: ResourceBlock) => Promise<any>> = {
  rds: rdsSave,
};

export default function saveLogic(node: ResourceBlock) {
  const nodeType = node.type; // first get the type of the node
  const handler = saveHandlers[nodeType] || defaultSave; // then check which handler to execute
  return handler(node);
}
