import { defaultSave } from "@/utils/defaultSave";
import { resourceBlock } from "@/utils/types/resource";
import { rdsSave } from "./rdsSaveHandle";

const saveHandlers: Record<string, (node: resourceBlock) => Promise<any>> = {
  rds: rdsSave,
};

export default function saveLogic(node: resourceBlock) {
  const nodeType = node.type; // first get the type of the node
  const handler = saveHandlers[nodeType] || defaultSave; // then check which handler to execute
  return handler(node);
}
