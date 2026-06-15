"use client";

import { useCallback, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  EdgeChange,
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
import { useCanvasSelection } from "./Canvas/useCanvasSelection";
import { useGhostMovement } from "./Canvas/useGhostMovement";
import { useCanvasConnection } from "./Canvas/useCanvasConnection";
import { useCanvasDragAndDrop } from "./Canvas/useCanvasDragAndDrop";

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
    selectedNodeId,
    selectedNode,
    selectNodes,
    updateNodeData,
    updateNodePosition,
  } = useDiagramStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // 1. Selection logic hook
  useCanvasSelection(
    selectedTool,
    nodes,
    selectNodes,
    canvasRef,
    selectionBoxRef
  );

  // 2. Ghost shape drawing & movement hook
  useGhostMovement(selectedTool, ghostRef);

  // 3. Node connections hook
  const { onConnect } = useCanvasConnection(nodes, addEdge);

  // 4. Node dragging, subnet boundary calculations & auto-assignment hook
  const { onNodesChangeHandler, onNodeDragStart, onNodeDragStop } =
    useCanvasDragAndDrop(nodes, setNodes, updateNodePosition, updateNodeData);

  function renderGhostShape(tool: string) {
    switch (tool) {
      case "rectangle":
        return <GhostRectangle ref={ghostRef} />;
      case "rhombus":
        return <GhostRhombus ref={ghostRef} />;
      case "circle":
        return <GhostCircle ref={ghostRef} />;
      case "select":
        return (
          <div
            ref={selectionBoxRef}
            className="absolute border border-emerald-400 bg-emerald-500/10 pointer-events-none z-[1001]"
            style={{ display: "none" }}
          />
        );
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
    return nodes.map((node) => {
      let extent: [[number, number], [number, number]] | undefined;

      if (node.type === "subnet") {
        const subnetVal = node.data as subnetData;
        const parentVpc = nodes.find(
          (n) => n.type === "vpc" && n.id === subnetVal.parentVpcId
        );

        if (parentVpc?.position) {
          const padding = 10;
          const vpcWidth = parentVpc.width ?? 200;
          const vpcHeight = parentVpc.height ?? 120;
          const vpcX = parentVpc.position.x;
          const vpcY = parentVpc.position.y;

          const minX = vpcX + padding;
          const minY = vpcY + padding;
          const maxX = vpcX + vpcWidth - padding;
          const maxY = vpcY + vpcHeight - padding;

          extent = [
            [minX, minY],
            [maxX, maxY],
          ];
        }
      }

      return {
        ...node,
        draggable: node.id === selectedNodeId,
        extent,
      };
    });
  }, [nodes, selectedNodeId]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log("Node clicked:", node.id);
      selectedNode(node.id);
    },
    [selectedNode]
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
    <div className="w-full h-full overflow-hidden" ref={canvasRef}>
      <ReactFlow
        fitView={false}
        nodes={memoizedNodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          instance.setViewport({ x: 0, y: 0, zoom: 1 });
        }}
        fitViewOptions={{ padding: 0.5 }}
        panOnDrag={selectedTool === "hand"}
        zoomOnScroll={true}
        panOnScroll={true}
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
              default:
                return "default";
            }
          })(),
        }}
      >
        <Controls />
        <Background gap={11} size={1} bgColor="#020817" color="#1E293B" />
      </ReactFlow>

      {renderGhostShape(selectedTool)}
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
