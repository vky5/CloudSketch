import { syncNodeWithBackend } from "./terraformSync";
import { ResourceBlock } from "./types/resource";

export function defaultSave(node: ResourceBlock) {
  return syncNodeWithBackend({
    id: node.id,
    type: node.type!,
    data: node.data,
  });
}