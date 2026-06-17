"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  EdgeChange,
  BackgroundVariant,
  SelectionMode,
  ConnectionMode,
  OnSelectionChangeFunc,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "@/store/useDiagramStore";
import { nodeTypes, getDefaultDataForNode } from "./Canvas/nodeTypes";
import GhostRectangle from "./nodes/ghosts/GhostRectangle";
import GhostRhombus from "./nodes/ghosts/GhostRhombus";
import GhostCircle from "./nodes/ghosts/GhostCircle";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { handleDisconnection } from "@/lib/graphProtocol/ugcp";
import { useUpdateNodeInternals } from "@xyflow/react";
import canConnect from "@/config/connectionsConfig";
import { areNodesAlreadyConnected } from "@/utils/connectionUtils";

// Imported Hooks
import { useGhostMovement } from "./Canvas/useGhostMovement";
import { useCanvasConnection } from "./Canvas/useCanvasConnection";
import { useCanvasDragAndDrop } from "./Canvas/useCanvasDragAndDrop";
import SelectionToolbar from "./Canvas/SelectionToolbar";
import EdgeDeleteToolbar from "./Canvas/EdgeDeleteToolbar";
import CanvasControls from "./Canvas/CanvasControls";

function FlowContent() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    addEdge,
    selectedTool,
    setSelectedTool,
    selectedNode,
    selectNodes,
    selectEdges,
    clearSelection,
    deleteNodes,
    updateNodeData,
    updateNodePosition,
    updateNodeParentAndPosition,
    deleteModal,
    confirmDelete,
    closeDeleteModal,
  } = useDiagramStore();

  const ghostRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      nodes.forEach((node) => updateNodeInternals(node.id));
    });
    return () => cancelAnimationFrame(frame);
  }, [nodes, updateNodeInternals]);

  // 1. Ghost shape drawing & movement hook
  useGhostMovement(selectedTool, ghostRef);

  // 3. Node connections hook
  const { onConnect } = useCanvasConnection(nodes, edges, addEdge);

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;
      if (areNodesAlreadyConnected(edges, connection.source, connection.target)) {
        return false;
      }

      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);
      if (!sourceNode?.type || !targetNode?.type) return false;

      return canConnect(sourceNode.type, targetNode.type);
    },
    [edges, nodes]
  );

  // 4. Node dragging, subnet boundary calculations & auto-assignment hook
  const { onNodesChangeHandler, onNodeDragStart, onNodeDragStop } =
    useCanvasDragAndDrop(
      nodes,
      setNodes,
      updateNodePosition,
      updateNodeData,
      updateNodeParentAndPosition
    );

  function renderGhostShape(tool: string) {
    switch (tool) {
      case "rectangle":
        return <GhostRectangle ref={ghostRef} />;
      case "rhombus":
        return <GhostRhombus ref={ghostRef} />;
      case "circle":
        return <GhostCircle ref={ghostRef} />;
      default:
        return null;
    }
  }

  const handlePaneClick = useCallback(
    async (event: React.MouseEvent) => {
      if (selectedTool === "select") {
        clearSelection();
        return;
      }

      const validNodeTypes = Object.keys(nodeTypes);
      if (!validNodeTypes.includes(selectedTool)) return;

      const { clientX, clientY } = event;
      const position = screenToFlowPosition({ x: clientX, y: clientY });

      const newNodeId = crypto.randomUUID();
      const newNode: Node<ResourceBlock["data"]> = {
        id: newNodeId,
        type: selectedTool || "unknown",
        position,
        draggable: false,
        data: getDefaultDataForNode(selectedTool, newNodeId),
      };

      try {
        await syncNodeWithBackend({
          id: newNode.id,
          type: newNode.type!,
          data: newNode.data,
        });
        addNode(newNode);
        selectedNode(newNode.id);
        setSelectedTool("hand");
      } catch (err) {
        console.error("Failed to sync with backend:", err);
      }
    },
    [selectedTool, screenToFlowPosition, addNode, selectedNode, setSelectedTool, clearSelection]
  );

  useEffect(() => console.log("Rendered"), []);

  const memoizedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: selectedTool === "select" && !!node.selected,
      extent: node.parentId ? ("parent" as const) : undefined,
    }));
  }, [nodes, selectedTool]);

  const memoizedEdges = useMemo(() => {
    const isSelectTool = selectedTool === "select";

    return edges.map((edge) => {
      const isSelected = !!edge.selected;

      return {
        ...edge,
        selectable: isSelectTool,
        deletable: isSelectTool,
        interactionWidth: 16,
        style: {
          ...edge.style,
          stroke: isSelected ? "#818cf8" : "#475569",
          strokeWidth: isSelected ? 2 : 1.5,
        },
      };
    });
  }, [edges, selectedTool]);

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      selectNodes(selectedNodes.map((node) => node.id));
      selectEdges(selectedEdges.map((edge) => edge.id));
    },
    [selectNodes, selectEdges]
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      if (selectedTool !== "select") return;

      const changes: EdgeChange[] = edges.flatMap((e) => {
        const shouldSelect = e.id === edge.id;
        if (e.selected === shouldSelect) return [];
        return [{ type: "select" as const, id: e.id, selected: shouldSelect }];
      });

      if (changes.length > 0) {
        setEdges(changes);
      }

      selectNodes([]);
    },
    [selectedTool, edges, setEdges, selectNodes]
  );

  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      deleteNodes(nodesToDelete.map((node) => node.id));
    },
    [deleteNodes]
  );

  const onEdgesChangeHandler = useCallback(
    (changes: EdgeChange[]) => {
      changes.forEach((change) => {
        if (change.type === "remove") {
          const edge = edges.find((e) => e.id === change.id);
          if (edge) {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (sourceNode && targetNode) {
              handleDisconnection(edge, sourceNode, targetNode);
            }
          }
        }
      });
      setEdges(changes);

      const nextEdges = applyEdgeChanges(changes, edges);
      selectEdges(nextEdges.filter((edge) => edge.selected).map((edge) => edge.id));
    },
    [edges, nodes, setEdges, selectEdges]
  );

  return (
    <div className="w-full h-full overflow-hidden relative">
      <ReactFlow
        fitView={false}
        nodes={memoizedNodes}
        edges={memoizedEdges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={handlePaneClick}
        onEdgeClick={onEdgeClick}
        onSelectionChange={onSelectionChange}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        elementsSelectable={selectedTool === "select"}
        edgesFocusable={selectedTool === "select"}
        selectionOnDrag={selectedTool === "select"}
        selectionMode={SelectionMode.Partial}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={selectedTool === "select" ? ["Delete", "Backspace"] : null}
        onInit={(instance) => {
          instance.setViewport({ x: 0, y: 0, zoom: 1 });
        }}
        fitViewOptions={{ padding: 0.5 }}
        panOnDrag={selectedTool === "hand"}
        zoomOnScroll={true}
        panOnScroll={true}
        defaultEdgeOptions={{
          animated: false,
          selectable: true,
          deletable: true,
          interactionWidth: 16,
        }}
        style={{
          cursor: (() => {
            switch (selectedTool) {
              case "hand":
                return "grab";
              case "rectangle":
              case "rhombus":
              case "circle":
              case "arrow":
              case "line":
                return "crosshair";
              case "text":
                return "text";
              case "select":
                return "default";
              default:
                return "default";
            }
          })(),
        }}
      >
        <Background gap={20} size={1.5} bgColor="#070913" color="#1E293B" variant={BackgroundVariant.Dots} />
        <SelectionToolbar />
        <EdgeDeleteToolbar />
      </ReactFlow>

      <CanvasControls />
      {renderGhostShape(selectedTool)}

      {/* Sleek Middle Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-[#131316] border border-[#2D2E35] rounded-xl p-6 w-[400px] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-white font-bold text-lg mb-2">Confirm Deletion</h3>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              {deleteModal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg bg-[#1E1F24] hover:bg-[#2D2E35] text-gray-300 hover:text-white text-sm font-medium transition-colors cursor-pointer border border-[#2D2E35]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <FlowContent />
      </div>
    </ReactFlowProvider>
  );
}
