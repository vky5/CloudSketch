import { create } from "zustand";
import {
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import { AnyNode, ResourceBlock } from "@/utils/types/resource";
import {
  DEFAULT_SUBNET_HEIGHT,
  DEFAULT_SUBNET_WIDTH,
  MIN_VPC_HEIGHT,
  MIN_VPC_WIDTH,
  SUBNET_BOTTOM_PADDING,
  SUBNET_PADDING,
  SUBNET_TOP_PADDING,
} from "@/utils/getNextSubnetPosition";
import { resolveVpcCollisions } from "@/utils/vpcLayout";
/*
Okay so two types Edge and Connnections
Edge includes Id connections doesnt
*/

interface DiagramState {
  nodes: AnyNode[];
  edges: Edge[];
  selectedNodeId: string | null; // for signle selected node (enables drag drop and resize)
  selectedTool: string;
  settingOpenNodeId: string | null; // for opening settings of a selected node
  selectedNodeIds: string[]; // for tracking multiple selected nodes
  selectedEdgeIds: string[];

  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  addNode: (node: AnyNode) => void;
  addEdge: (edge: Edge | Connection) => void;

  setSelectedTool: (tool: string) => void;
  openSettings: (id: string) => void; // this will be used to open settings for a selected node only (earlier was using it for settings as well)
  selectedNode: (id: string | null) => void; // this will be used to select a node
  handOffToSelectNode: (id: string) => void;
  closeSettings: () => void;
  selectNodes: (ids: string[]) => void; // set a large number of nodes in selected in selectedNodeIds
  selectEdges: (ids: string[]) => void;
  clearSelection: () => void;
  clearSelectedNodes: () => void;
  deleteNodes: (ids: string[]) => void;
  updateNodeData: (id: string, newData: Partial<ResourceBlock["data"]>) => void;
  updateNodeDimensions: (id: string, width: number, height: number) => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeParentAndPosition: (id: string, parentId: string | undefined, x: number, y: number) => void;
  setNodesAndEdges: (nodes: AnyNode[], edges: Edge[]) => void;
  deleteNode: (id: string) => void;
  clearAll: () => void;

  deleteModal: {
    isOpen: boolean;
    nodeId: string | null;
    message: string;
  };
  triggerDeleteConfirmation: (id: string, message: string) => void;
  confirmDelete: () => void;
  closeDeleteModal: () => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedTool: "select", // Default tool
  selectedNodeIds: [],
  selectedEdgeIds: [],
  settingOpenNodeId: null,

  setNodes: (changes: NodeChange[]) =>
    set((state) => {
      if (changes.length > 0 && changes.every((change) => change.type === "replace")) {
        return state;
      }

      if (changes.length > 0 && changes.every((change) => change.type === "select")) {
        const nextNodes = applyNodeChanges(changes, state.nodes).map((node) =>
          withFlowPresentation(node as AnyNode, state.selectedTool)
        ) as AnyNode[];
        const selectedIds = nextNodes.filter((node) => node.selected).map((node) => node.id);
        return {
          nodes: nextNodes,
          selectedNodeIds: selectedIds,
          selectedNodeId:
            selectedIds.length === 1
              ? selectedIds[0]
              : selectedIds.length > 0
                ? selectedIds[0]
                : null,
        };
      }

      const nextNodes = applyNodeChanges(changes, state.nodes) as AnyNode[];
      const isDragging = nextNodes.some((node) => node.dragging);

      return {
        nodes: layoutNodes(nextNodes, state.nodes, { skipAutoExpand: isDragging }),
      };
    }),

  setEdges: (changes) =>
    set((state) => {
      if (changes.length > 0 && changes.every((change) => change.type === "select")) {
        return state;
      }
      return { edges: applyEdgeChanges(changes, state.edges) };
    }),

  addNode: (node: AnyNode) =>
    set((state) => {
      if (state.nodes.some((n) => n.id === node.id)) {
        return {};
      }
      return {
        nodes: layoutNodes(
          [...state.nodes, withFlowPresentation(node, state.selectedTool)],
          state.nodes
        ),
      };
    }),

  addEdge: (edge: Edge | Connection) =>
    set((state) => {
      const newEdge = { ...edge, id: "id" in edge ? edge.id : crypto.randomUUID() } as Edge;
      if (state.edges.some((e) => e.id === newEdge.id)) {
        return {};
      }
      return {
        edges: [...state.edges, newEdge],
      };
    }),

  setSelectedTool: (tool) =>
    set((state) => {
      if (state.selectedTool === tool) return state;
      return {
        selectedTool: tool,
        nodes: state.nodes.map((node) => withFlowPresentation(node, tool)),
      };
    }),

  openSettings: (id) => set({ settingOpenNodeId: id }),
  selectedNode: (id) =>
    set((state) => ({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
      nodes: state.nodes.map((node) =>
        withFlowPresentation({ ...node, selected: id ? node.id === id : false }, state.selectedTool)
      ),
    })),

  handOffToSelectNode: (id) =>
    set((state) => {
      const tool = "select";
      return {
        selectedTool: tool,
        selectedNodeId: id,
        selectedNodeIds: [id],
        nodes: state.nodes.map((node) =>
          withFlowPresentation({ ...node, selected: node.id === id }, tool)
        ),
      };
    }),

  closeSettings: () => set({ settingOpenNodeId: null }),

  selectNodes: (ids) =>
    set((state) => {
      const sameSelection =
        state.selectedNodeIds.length === ids.length &&
        state.selectedNodeIds.every((id) => ids.includes(id));
      if (sameSelection) return state;

      return {
        selectedNodeIds: ids,
        selectedNodeId: ids.length === 1 ? ids[0] : ids.length > 0 ? ids[0] : null,
        nodes: state.nodes.map((node) =>
          withFlowPresentation({ ...node, selected: ids.includes(node.id) }, state.selectedTool)
        ),
      };
    }),
  selectEdges: (ids) => set({ selectedEdgeIds: ids }),
  clearSelection: () =>
    set((state) => ({
      selectedNodeIds: [],
      selectedNodeId: null,
      selectedEdgeIds: [],
      nodes: state.nodes.map((node) =>
        withFlowPresentation({ ...node, selected: false }, state.selectedTool)
      ),
      edges: state.edges.map((edge) => ({ ...edge, selected: false })),
    })),
  clearSelectedNodes: () =>
    set((state) => ({
      selectedNodeIds: [],
      selectedNodeId: null,
      selectedEdgeIds: [],
      nodes: state.nodes.map((node) =>
        withFlowPresentation({ ...node, selected: false }, state.selectedTool)
      ),
      edges: state.edges.map((edge) => ({ ...edge, selected: false })),
    })),

  deleteNodes: (ids: string[]) =>
    set((state) => {
      if (ids.length === 0) return {};

      const idsToDelete = new Set<string>(ids);
      let foundNew = true;
      while (foundNew) {
        foundNew = false;
        state.nodes.forEach((node) => {
          if (node.parentId && idsToDelete.has(node.parentId) && !idsToDelete.has(node.id)) {
            idsToDelete.add(node.id);
            foundNew = true;
          }
        });
      }

      const nextNodes = state.nodes.filter((node) => !idsToDelete.has(node.id));
      const nextEdges = state.edges.filter(
        (edge) => !idsToDelete.has(edge.source) && !idsToDelete.has(edge.target)
      );
      return {
        nodes: layoutNodes(nextNodes, state.nodes),
        edges: nextEdges,
        selectedNodeId: idsToDelete.has(state.selectedNodeId || "") ? null : state.selectedNodeId,
        selectedNodeIds: state.selectedNodeIds.filter((nId) => !idsToDelete.has(nId)),
        settingOpenNodeId: idsToDelete.has(state.settingOpenNodeId || "") ? null : state.settingOpenNodeId,
      };
    }),

  updateNodeData: (id: string, newData: Partial<ResourceBlock["data"]>) =>
    set((state) => {
      const nextNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      );
      return { nodes: layoutNodes(nextNodes, state.nodes) };
    }),

  updateNodeDimensions: (id: string, width: number, height: number) =>
    set((state) => {
      const nextNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, width, height } : node
      );
      return { nodes: layoutNodes(nextNodes, state.nodes) };
    }),

  updateNodePosition: (id: string, x: number, y: number) =>
    set((state) => {
      const nextNodes = state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              position: { ...node.position, x, y },
              positionAbsoluteX: x,
              positionAbsoluteY: y,
            }
          : node
      );
      return { nodes: layoutNodes(nextNodes, state.nodes) };
    }),

  updateNodeParentAndPosition: (id: string, parentId: string | undefined, x: number, y: number) =>
    set((state) => {
      const nextNodes = state.nodes.map((node) =>
        node.id === id
          ? {
              ...node,
              parentId,
              position: { x, y },
              positionAbsoluteX: x,
              positionAbsoluteY: y,
            }
          : node
      );
      return { nodes: layoutNodes(nextNodes, state.nodes) };
    }),

  setNodesAndEdges: (nodes, edges) =>
    set((state) => {
      const uniqueNodes = nodes.filter((n, idx, self) => self.findIndex((x) => x.id === n.id) === idx);
      const uniqueEdges = edges.filter((e, idx, self) => self.findIndex((x) => x.id === e.id) === idx);
      return {
        nodes: layoutNodes(uniqueNodes, []).map((node) =>
          withFlowPresentation(node, state.selectedTool)
        ),
        edges: uniqueEdges,
      };
    }),

  deleteNode: (id: string) => get().deleteNodes([id]),

  clearAll: () =>
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      selectedNodeIds: [],
      selectedEdgeIds: [],
      settingOpenNodeId: null,
    }),

  deleteModal: {
    isOpen: false,
    nodeId: null,
    message: "",
  },

  triggerDeleteConfirmation: (id: string, message: string) =>
    set({
      deleteModal: {
        isOpen: true,
        nodeId: id,
        message,
      },
    }),

  confirmDelete: () => {
    const id = get().deleteModal.nodeId;
    if (id) get().deleteNodes([id]);
    set({
      deleteModal: {
        isOpen: false,
        nodeId: null,
        message: "",
      },
    });
  },

  closeDeleteModal: () =>
    set({
      deleteModal: {
        isOpen: false,
        nodeId: null,
        message: "",
      },
    }),
}));

function getFlowZIndex(type: string | undefined): number {
  switch (type) {
    case "vpc":
      return 0;
    case "subnet":
      return 1;
    case "ec2":
    case "rds":
    case "lambda":
      return 10;
    default:
      return 5;
  }
}

function withFlowPresentation(node: AnyNode, selectedTool: string): AnyNode {
  return {
    ...node,
    draggable: selectedTool === "select" && !!node.selected,
    selectable: selectedTool === "select",
    extent: node.type === "subnet" && node.parentId ? ("parent" as const) : undefined,
    zIndex: node.zIndex ?? getFlowZIndex(node.type),
  };
}

function layoutNodes(
  nextNodes: AnyNode[],
  prevNodes: AnyNode[],
  options?: { skipAutoExpand?: boolean }
): AnyNode[] {
  let nodes = resolveSubnetCollisions(nextNodes, prevNodes);

  if (!options?.skipAutoExpand && !nodes.some((node) => node.dragging)) {
    nodes = autoExpandContainers(nodes);
  }

  nodes = resolveVpcCollisions(nodes, prevNodes);
  return sortNodesParentFirst(nodes);
}

/** React Flow requires every parent node to appear before its children in the array. */
function sortNodesParentFirst(nodes: AnyNode[]): AnyNode[] {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const sorted: AnyNode[] = [];
  const visited = new Set<string>();

  const visit = (node: AnyNode) => {
    if (visited.has(node.id)) return;
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) visit(parent);
    }
    visited.add(node.id);
    sorted.push(node);
  };

  nodes.forEach(visit);
  return sorted;
}

function subnetBounds(node: AnyNode) {
  const width = node.width ?? 260;
  const height = node.height ?? 180;
  return {
    left: node.position.x,
    right: node.position.x + width,
    top: node.position.y,
    bottom: node.position.y + height,
    width,
    height,
  };
}

function subnetsOverlap(a: AnyNode, b: AnyNode): boolean {
  const ab = subnetBounds(a);
  const bb = subnetBounds(b);
  return ab.left < bb.right && ab.right > bb.left && ab.top < bb.bottom && ab.bottom > bb.top;
}

function resolveSubnetCollisions(nextNodes: AnyNode[], prevNodes: AnyNode[]): AnyNode[] {
  const resolved = nextNodes.map((node) => ({ ...node }));

  const subnetsByVpc = new Map<string, AnyNode[]>();
  resolved
    .filter((node) => node.type === "subnet" && node.parentId)
    .forEach((subnet) => {
      const siblings = subnetsByVpc.get(subnet.parentId!) ?? [];
      siblings.push(subnet);
      subnetsByVpc.set(subnet.parentId!, siblings);
    });

  subnetsByVpc.forEach((subnets) => {
    for (let i = 0; i < subnets.length; i++) {
      for (let j = i + 1; j < subnets.length; j++) {
        const a = subnets[i];
        const b = subnets[j];
        if (!subnetsOverlap(a, b)) continue;

        const prevA = prevNodes.find((node) => node.id === a.id);
        const prevB = prevNodes.find((node) => node.id === b.id);
        const aMoved =
          !prevA ||
          a.position.x !== prevA.position.x ||
          a.position.y !== prevA.position.y ||
          a.width !== prevA.width ||
          a.height !== prevA.height;
        const bMoved =
          !prevB ||
          b.position.x !== prevB.position.x ||
          b.position.y !== prevB.position.y ||
          b.width !== prevB.width ||
          b.height !== prevB.height;

        const revertTarget = aMoved && !bMoved ? a : bMoved && !aMoved ? b : a.dragging ? a : b;

        const prevTarget = prevNodes.find((node) => node.id === revertTarget.id);
        if (!prevTarget) continue;

        const index = resolved.findIndex((node) => node.id === revertTarget.id);
        if (index === -1) continue;

        resolved[index] = {
          ...resolved[index],
          position: { ...prevTarget.position },
          width: prevTarget.width,
          height: prevTarget.height,
        };

        subnets[i] = resolved.find((node) => node.id === subnets[i].id)!;
        subnets[j] = resolved.find((node) => node.id === subnets[j].id)!;
      }
    }
  });

  return resolved;
}

function autoExpandContainers(nodes: AnyNode[]): AnyNode[] {
  const nodesMap = new Map<string, AnyNode>();
  nodes.forEach((n) => nodesMap.set(n.id, { ...n }));

  const getChildren = (parentId: string) => {
    return Array.from(nodesMap.values()).filter((n) => n.parentId === parentId);
  };

  // Subnet size is manual (NodeResizer) — do not auto-grow from EC2/RDS/Lambda children.

  // Expand/Shrink VPCs to contain subnet children
  const vpcs = Array.from(nodesMap.values()).filter((n) => n.type === "vpc");
  vpcs.forEach((vpc) => {
    const children = getChildren(vpc.id);
    if (children.length === 0) return;

    let maxRight = 0;
    let maxBottom = 0;

    children.forEach((child) => {
      if (!child.position) return;

      const cw = child.width ?? DEFAULT_SUBNET_WIDTH;
      const ch = child.height ?? DEFAULT_SUBNET_HEIGHT;

      if (child.position.x < SUBNET_PADDING) {
        child.position.x = SUBNET_PADDING;
      }
      if (child.position.y < SUBNET_TOP_PADDING) {
        child.position.y = SUBNET_TOP_PADDING;
      }

      const rightEdge = child.position.x + cw + SUBNET_PADDING;
      const bottomEdge = child.position.y + ch + SUBNET_BOTTOM_PADDING;

      if (rightEdge > maxRight) maxRight = rightEdge;
      if (bottomEdge > maxBottom) maxBottom = bottomEdge;

      nodesMap.set(child.id, child);
    });

    vpc.width = Math.max(vpc.width ?? MIN_VPC_WIDTH, MIN_VPC_WIDTH, maxRight);
    vpc.height = Math.max(vpc.height ?? MIN_VPC_HEIGHT, MIN_VPC_HEIGHT, maxBottom);
    nodesMap.set(vpc.id, vpc);
  });

  return Array.from(nodesMap.values());
}

// a global storage for all noodes/edges
// openSettings will open settings for the selected id
// closeSettings will close the settings for the selected id
// update node will update the node info
