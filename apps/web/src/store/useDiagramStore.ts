import { create } from "zustand";
import {
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";

/*
Okay so two types Edge and Connnections
Edge includes Id connections doesnt
*/

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedTool: string; // NEW

  setNodes: (changes: NodeChange[]) => void;
  setEdges: (changes: EdgeChange[]) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge | Connection) => void;


  setSelectedTool: (tool: string) => void; // NEW
  openSettings: (id: string) => void;
  closeSettings: () => void;
  updateNodeData: (id: string, newData: any) => void;
}

export const useDiagramStore = create<DiagramState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedTool: "select", // Default tool

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

  openSettings: (id) => set({ selectedNodeId: id }),
  closeSettings: () => set({ selectedNodeId: null }),

  updateNodeData: (id, newData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
      ),
    })),
}));

// a global storage for all noodes/edges
// openSettings will open settings for the selected id
// closeSettings will close the settings for the selected id
// update node will update the node info
