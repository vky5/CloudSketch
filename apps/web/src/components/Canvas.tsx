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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css"; 
import { useDiagramStore } from "@/store/useDiagramStore";
import { nodeTypes } from "./Canvas/nodeTypes";

// function is pure and will never change, if u put in the main component it will rerender everytime
function mapItemToNodeType(name: string): string {
  console.log("mapItemToNodeType called with:", name);
  if (name.includes("rectangle")) return "rectangle";
  if (name.includes("rhombus")) return "rhombus";
  if (name.includes("EC2")) return "ec2";
  return "default";
}

function FlowContent() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    addEdge,
    selectedTool,
    selectedNodeId,
    openSettings,
  } = useDiagramStore();

  // using hook to reference to canvas
  const canvasRef = useRef<HTMLDivElement>(null);
  useEffect(() => console.log("Rendered"));

  const { screenToFlowPosition } = useReactFlow();

  const memoizedNodes = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      draggable: node.id === selectedNodeId,
    }));
  }, [nodes, selectedNodeId, selectedTool]);

  // Add connection as a new edge
  const onConnect = (params: Edge | Connection) => {
    addEdge(params);
  };

  const onNodeClick = useCallback((event, node) => {
    console.log("Node clicked:", node.id);
    openSettings(node.id);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // this is the logic for on drop which is to put in the rectangle
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const itemData = JSON.parse(
        event.dataTransfer.getData("application/json")
      );

      const screenX = event.clientX;
      const screenY = event.clientY;

      const position = screenToFlowPosition({
        x: screenX,
        y: screenY,
      });

      const type = mapItemToNodeType(itemData.name);

      if (!["rectangle", "rhombus", "ec2"].includes(type)) {
        console.log("Returning, ", type);
        return;
      }

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        draggable: false, // initially not draggable
        data: {
          ...itemData,
          label: itemData.name,
        },
      };
      console.log("Dropped node:", newNode);
      addNode(newNode);
      openSettings(newNode.id);
    },
    [addNode]
  );

  const onNodesChangeHandler = useCallback(
    (changes) => {
      setNodes(changes);
    },
    [setNodes]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = "not-allowed";
    console.log("Canvas is : ", canvas?.style.cursor);

    console.log("Clicked canvas with tool:", selectedTool);
    console.log("Adding node:", nodes);
  }, [selectedTool]);

  const onNodeDragStart = useCallback(() => {
    console.log("Node drag started");
  }, []);

  const onNodeDragStop = useCallback(() => {
    console.log("Node drag stopped");
  }, []);

  return (
    <div className="w-full h-full overflow-hidden" ref={canvasRef}>
      <ReactFlow
        nodes={memoizedNodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={setEdges}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        onDrop={onDrop}
        onDragOver={onDragOver}
        // onPaneClick={onCanvasClick}
        // nodesDraggable={selectedTool === "select"} // drag component only when select tool is selected not ideal
        nodeTypes={nodeTypes}
        onInit={(instance) => {
          instance.fitView();
        }}
        fitViewOptions={{ padding: 0.5 }}
        panOnDrag={selectedTool === "hand"}
        zoomOnScroll={true}
        panOnScroll={true}
        style={{
          cursor:
            selectedTool === "hand"
              ? "grab"
              : selectedTool === "rectangle" || selectedTool === "circle"
              ? "crosshair"
              : "default",
        }}
      >
        <Controls />
        <Background gap={11} size={1} bgColor="#020817"/>
      </ReactFlow>
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
