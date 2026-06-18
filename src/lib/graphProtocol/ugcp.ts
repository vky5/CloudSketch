import { Node, Edge } from "@xyflow/react";
import { contractRegistry } from "./contractRegistry";
import { useDiagramStore } from "@/store/useDiagramStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";

export async function handleContainment(
  childNode: Node,
  containerNode: Node | null
): Promise<void> {
  const childType = childNode.type;
  if (!childType) return;

  const contract = contractRegistry[childType];
  const { updateNodeData } = useDiagramStore.getState();

  // If containerNode is null, it means the child has exited whatever parent it had
  if (!containerNode) {
    let oldParentId: string | undefined;
    if (childNode.data.SubnetID) oldParentId = childNode.data.SubnetID as string;
    else if (childNode.data.parentVpcId) oldParentId = childNode.data.parentVpcId as string;

    if (oldParentId) {
      const oldParentNode = useDiagramStore.getState().nodes.find((n) => n.id === oldParentId);
      if (oldParentNode && contract?.onContainerExit) {
        const res = contract.onContainerExit(childNode, oldParentNode);
        if (res.success && res.updatedSourceData) {
          updateNodeData(childNode.id, res.updatedSourceData);
          await syncNodeWithBackend({
            id: childNode.id,
            type: childType,
            data: {
              ...childNode.data,
              ...res.updatedSourceData,
            } as ResourceBlock["data"],
          });
        }
      }
    }
    return;
  }

  // If entering a container
  if (contract?.onContainerEnter) {
    const res = contract.onContainerEnter(childNode, containerNode);
    if (res.success && res.updatedSourceData) {
      updateNodeData(childNode.id, res.updatedSourceData);
      await syncNodeWithBackend({
        id: childNode.id,
        type: childType,
        data: {
          ...childNode.data,
          ...res.updatedSourceData,
        } as ResourceBlock["data"],
      });
    }
  }
}

export function handleConnection(
  edge: Edge,
  sourceNode: Node,
  targetNode: Node
): { success: boolean; error?: string } {
  const sourceContract = sourceNode.type ? contractRegistry[sourceNode.type] : null;
  const targetContract = targetNode.type ? contractRegistry[targetNode.type] : null;
  const { updateNodeData } = useDiagramStore.getState();

  // 1. Source Handshake
  if (sourceContract?.onConnectionRequest) {
    const res = sourceContract.onConnectionRequest(sourceNode, targetNode, "source", edge);
    if (!res.success) return { success: false, error: res.error };

    if (res.updatedSourceData) updateNodeData(sourceNode.id, res.updatedSourceData);
    if (res.updatedTargetData) updateNodeData(targetNode.id, res.updatedTargetData);
  }

  // 2. Target Handshake
  if (targetContract?.onConnectionRequest) {
    const res = targetContract.onConnectionRequest(targetNode, sourceNode, "target", edge);
    if (!res.success) return { success: false, error: res.error };

    if (res.updatedSourceData) updateNodeData(targetNode.id, res.updatedSourceData);
    if (res.updatedTargetData) updateNodeData(sourceNode.id, res.updatedTargetData);
  }

  return { success: true };
}

export function handleDisconnection(
  edge: Edge,
  sourceNode: Node,
  targetNode: Node
): void {
  const sourceContract = sourceNode.type ? contractRegistry[sourceNode.type] : null;
  const targetContract = targetNode.type ? contractRegistry[targetNode.type] : null;
  const { updateNodeData } = useDiagramStore.getState();

  // 1. Source Disconnect Handshake
  if (sourceContract?.onConnectionDelete) {
    const res = sourceContract.onConnectionDelete(sourceNode, targetNode, "source", edge);
    if (res.success) {
      if (res.updatedSourceData) updateNodeData(sourceNode.id, res.updatedSourceData);
      if (res.updatedTargetData) updateNodeData(targetNode.id, res.updatedTargetData);
    }
  }

  // 2. Target Disconnect Handshake
  if (targetContract?.onConnectionDelete) {
    const res = targetContract.onConnectionDelete(targetNode, sourceNode, "target", edge);
    if (res.success) {
      if (res.updatedSourceData) updateNodeData(targetNode.id, res.updatedSourceData);
      if (res.updatedTargetData) updateNodeData(sourceNode.id, res.updatedTargetData);
    }
  }
}
