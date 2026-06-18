import { Node, Edge } from "@xyflow/react";
import { ResourceBlock } from "@/utils/types/resource";

export type GraphSignalType =
  | "CONTAINER_ENTER"
  | "CONTAINER_EXIT"
  | "CONNECTION_REQUEST"
  | "CONNECTION_DELETE";

export interface GraphSignalPayload {
  signalType: GraphSignalType;
  sourceNode: Node;
  targetNode?: Node;
  edge?: Edge;
  extraData?: Record<string, unknown>;
}

export interface SignalResponse {
  success: boolean;
  updatedSourceData?: Partial<ResourceBlock["data"]>;
  updatedTargetData?: Partial<ResourceBlock["data"]>;
  error?: string;
}

export interface NodeCommunicationContract {
  // Triggered when a node enters a parent container (e.g. EC2 dropped in Subnet)
  onContainerEnter?: (childNode: Node, containerNode: Node) => SignalResponse;

  // Triggered when a node leaves a parent container
  onContainerExit?: (childNode: Node, containerNode: Node) => SignalResponse;

  // Triggered when an edge connects source -> target
  onConnectionRequest?: (
    currentNode: Node,
    otherNode: Node,
    role: "source" | "target",
    edge: Edge
  ) => SignalResponse;

  // Triggered when an edge is deleted
  onConnectionDelete?: (
    currentNode: Node,
    otherNode: Node,
    role: "source" | "target",
    edge: Edge
  ) => SignalResponse;
}
