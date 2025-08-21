import { syncNodeWithBackend } from "./terraformSync";
import { resourceBlock } from "./types/resource";

export function defaultSave(node: resourceBlock) {
  return syncNodeWithBackend({
    id: node.id,
    type: node.type!,
    data: node.data,
  });
}