import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
/*
Okay so two types Edge and Connnections
Edge includes Id connections doesnt
*/

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null; // for signle selected node (enables drag drop and resize)
  selectedTool: string;
  settingOpenNodeId: string | null; // for opening settings of a selected node
  selectedNodeIds: string[]; // for tracking multiple selected nodes

  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge | Connection) => void;

  setSelectedTool: (tool: string) => void;
  openSettings: (id: string) => void; // this will be used to open settings for a selected node only (earlier was using it for settings as well)
  selectedNode: (id: string) => void; // this will be used to select a node
  closeSettings: () => void;
  selectNodes: (ids: string[]) => void; // set a large number of nodes in selected in selectedNodeIds
  clearSelectedNodes: () => void;
  updateNodeData: (id: string, newData: any) => void;
  updateNodeDimensions: (id: string, width: number, height: number) => void;
}

export const useDiagramStore = create<DiagramState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedTool: "select", // Default tool
  selectedNodeIds: [],
  settingOpenNodeId: null,

  setNodes: (changes) =>
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    })),

  setEdges: (changes) =>
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    })),

  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),

  addEdge: (edge) =>
    set((state) => ({
      edges: [...state.edges, { ...edge, id: crypto.randomUUID() } as Edge], // sometimes the connection doesnt include
    })),

  setSelectedTool: (tool) => set({ selectedTool: tool }),

  openSettings: (id) => set({ settingOpenNodeId: id }), // this will be used to give open setting of a selected node (if there is any & also prevent the drag of non selected tool; for selection of node for border like excalidraw or drag)
  selectedNode: (id)=> set({ selectedNodeId: id }), // this will be used to select a node 
  closeSettings: () => set({ settingOpenNodeId: null }),

  selectNodes: (ids) => set({ selectedNodeIds: ids }), // this is for the selection and here the ids is the array of ids that is selected
  clearSelectedNodes: () => set({ selectedNodeIds: [] }),

  updateNodeData: (id, newData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    })),

  updateNodeDimensions: (id, width, height) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, width, height } : node
      ),
    })),
}));

// a global storage for all noodes/edges
// openSettings will open settings for the selected id
// closeSettings will close the settings for the selected id
// update node will update the node info
