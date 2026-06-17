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
      const nextNodes = applyNodeChanges(changes, state.nodes) as AnyNode[];
      const collisionResolved = resolveSubnetCollisions(nextNodes, state.nodes);
      const expanded = autoExpandContainers(collisionResolved);
      return { nodes: expanded };
    }),

  setEdges: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  addNode: (node: AnyNode) =>
    set((state) => {
      if (state.nodes.some((n) => n.id === node.id)) {
        return {};
      }
      const expanded = autoExpandContainers([...state.nodes, node]);
      return {
        nodes: expanded,
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

  setSelectedTool: (tool) => set({ selectedTool: tool }),

  openSettings: (id) => set({ settingOpenNodeId: id }),
  selectedNode: (id) =>
    set((state) => ({
      selectedNodeId: id,
      selectedNodeIds: id ? [id] : [],
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: id ? node.id === id : false,
      })),
    })),
  closeSettings: () => set({ settingOpenNodeId: null }),

  selectNodes: (ids) =>
    set((state) => ({
      selectedNodeIds: ids,
      selectedNodeId: ids.length === 1 ? ids[0] : ids.length > 0 ? ids[0] : null,
      nodes: state.nodes.map((node) => ({
        ...node,
        selected: ids.includes(node.id),
      })),
    })),
  selectEdges: (ids) => set({ selectedEdgeIds: ids }),
  clearSelection: () =>
    set((state) => ({
      selectedNodeIds: [],
      selectedNodeId: null,
      selectedEdgeIds: [],
      nodes: state.nodes.map((node) => ({ ...node, selected: false })),
      edges: state.edges.map((edge) => ({ ...edge, selected: false })),
    })),
  clearSelectedNodes: () =>
    set((state) => ({
      selectedNodeIds: [],
      selectedNodeId: null,
      selectedEdgeIds: [],
      nodes: state.nodes.map((node) => ({ ...node, selected: false })),
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
      const expanded = autoExpandContainers(nextNodes);

      return {
        nodes: expanded,
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
      const expanded = autoExpandContainers(nextNodes);
      return { nodes: expanded };
    }),

  updateNodeDimensions: (id: string, width: number, height: number) =>
    set((state) => {
      const nextNodes = state.nodes.map((node) =>
        node.id === id ? { ...node, width, height } : node
      );
      const collisionResolved = resolveSubnetCollisions(nextNodes, state.nodes);
      const expanded = autoExpandContainers(collisionResolved);
      return { nodes: expanded };
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
      const collisionResolved = resolveSubnetCollisions(nextNodes, state.nodes);
      const expanded = autoExpandContainers(collisionResolved);
      return { nodes: expanded };
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
      const collisionResolved = resolveSubnetCollisions(nextNodes, state.nodes);
      const expanded = autoExpandContainers(collisionResolved);
      return { nodes: expanded };
    }),

  setNodesAndEdges: (nodes, edges) =>
    set(() => {
      const uniqueNodes = nodes.filter((n, idx, self) => self.findIndex((x) => x.id === n.id) === idx);
      const uniqueEdges = edges.filter((e, idx, self) => self.findIndex((x) => x.id === e.id) === idx);
      const expanded = autoExpandContainers(uniqueNodes);
      return { nodes: expanded, edges: uniqueEdges };
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

function resolveSubnetCollisions(nextNodes: AnyNode[], prevNodes: AnyNode[]): AnyNode[] {
  return nextNodes.map((node) => {
    if (node.type === "subnet" && node.parentId) {
      const siblings = nextNodes.filter(
        (n) => n.id !== node.id && n.type === "subnet" && n.parentId === node.parentId
      );

      const hasOverlap = siblings.some((sib) => {
        const ax1 = node.position.x;
        const ax2 = node.position.x + (node.width ?? 260);
        const ay1 = node.position.y;
        const ay2 = node.position.y + (node.height ?? 180);

        const bx1 = sib.position.x;
        const bx2 = sib.position.x + (sib.width ?? 260);
        const by1 = sib.position.y;
        const by2 = sib.position.y + (sib.height ?? 180);

        return ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1;
      });

      if (hasOverlap) {
        const prevNode = prevNodes.find((n) => n.id === node.id);
        if (prevNode) {
          return {
            ...node,
            position: prevNode.position,
            width: prevNode.width,
            height: prevNode.height,
          };
        }
      }
    }
    return node;
  });
}

function autoExpandContainers(nodes: AnyNode[]): AnyNode[] {
  const nodesMap = new Map<string, AnyNode>();
  nodes.forEach((n) => nodesMap.set(n.id, { ...n }));

  const getChildren = (parentId: string) => {
    return Array.from(nodesMap.values()).filter((n) => n.parentId === parentId);
  };

  // Phase 1: Expand/Shrink Subnets to contain compute/database resources
  const subnets = Array.from(nodesMap.values()).filter((n) => n.type === "subnet");
  subnets.forEach((subnet) => {
    const children = getChildren(subnet.id);
    if (children.length === 0) return;

    const minX = 16;
    const minY = 32; 
    let maxX = 0;
    let maxY = 0;

    children.forEach((child) => {
      if (!child.position) return;

      const cw = child.width ?? 176;
      const ch = child.height ?? 52;

      if (child.position.x < minX) {
        child.position.x = minX;
      }
      if (child.position.y < minY) {
        child.position.y = minY;
      }

      const rightEdge = child.position.x + cw + 16;
      const bottomEdge = child.position.y + ch + 16;

      if (rightEdge > maxX) maxX = rightEdge;
      if (bottomEdge > maxY) maxY = bottomEdge;

      nodesMap.set(child.id, child);
    });

    subnet.width = Math.max(260, maxX);
    subnet.height = Math.max(180, maxY);
    nodesMap.set(subnet.id, subnet);
  });

  // Phase 2: Expand/Shrink VPCs to contain Subnets
  const vpcs = Array.from(nodesMap.values()).filter((n) => n.type === "vpc");
  vpcs.forEach((vpc) => {
    const children = getChildren(vpc.id);
    if (children.length === 0) return;

    const minX = 20;
    const minY = 36;
    let maxX = 0;
    let maxY = 0;

    children.forEach((child) => {
      if (!child.position) return;

      const cw = child.width ?? 260;
      const ch = child.height ?? 180;

      if (child.position.x < minX) {
        child.position.x = minX;
      }
      if (child.position.y < minY) {
        child.position.y = minY;
      }

      const rightEdge = child.position.x + cw + 20;
      const bottomEdge = child.position.y + ch + 20;

      if (rightEdge > maxX) maxX = rightEdge;
      if (bottomEdge > maxY) maxY = bottomEdge;

      nodesMap.set(child.id, child);
    });

    vpc.width = Math.max(600, maxX);
    vpc.height = Math.max(400, maxY);
    nodesMap.set(vpc.id, vpc);
  });

  return Array.from(nodesMap.values());
}

// a global storage for all noodes/edges
// openSettings will open settings for the selected id
// closeSettings will close the settings for the selected id
// update node will update the node info
