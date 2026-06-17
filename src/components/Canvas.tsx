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
  OnSelectionChangeFunc,
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

// Imported Hooks
import { useGhostMovement } from "./Canvas/useGhostMovement";
import { useCanvasConnection } from "./Canvas/useCanvasConnection";
import { useCanvasDragAndDrop } from "./Canvas/useCanvasDragAndDrop";
import SelectionToolbar from "./Canvas/SelectionToolbar";
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

  // 1. Ghost shape drawing & movement hook
  useGhostMovement(selectedTool, ghostRef);

  // 3. Node connections hook
  const { onConnect } = useCanvasConnection(nodes, addEdge);

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
    [selectedTool, screenToFlowPosition, addNode, selectedNode, setSelectedTool]
  );

  useEffect(() => console.log("Rendered"), []);

  const memoizedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: selectedTool === "select" && !!node.selected,
      extent: node.parentId ? ("parent" as const) : undefined,
    }));
  }, [nodes, selectedTool]);

  const onSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      selectNodes(selectedNodes.map((node) => node.id));
    },
    [selectNodes]
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
    },
    [edges, nodes, setEdges]
  );

  return (
    <div className="w-full h-full overflow-hidden relative">
      <ReactFlow
        fitView={false}
        nodes={memoizedNodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={handlePaneClick}
        onSelectionChange={onSelectionChange}
        onNodesDelete={onNodesDelete}
        nodeTypes={nodeTypes}
        elementsSelectable={selectedTool === "select"}
        selectionOnDrag={selectedTool === "select"}
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={selectedTool === "select" ? ["Delete", "Backspace"] : null}
        onInit={(instance) => {
          instance.setViewport({ x: 0, y: 0, zoom: 1 });
        }}
        fitViewOptions={{ padding: 0.5 }}
        panOnDrag={selectedTool === "hand"}
        zoomOnScroll={true}
        panOnScroll={true}
        defaultEdgeOptions={{
          style: { stroke: "#475569", strokeWidth: 1.5 },
          animated: false,
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
