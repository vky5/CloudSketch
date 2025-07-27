"use client";

import { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
} from "reactflow";

import "reactflow/dist/style.css";
import { useDiagramStore } from "@/store/useDiagramStore";

// importing all nodes
import EC2Node from "./nodes/EC2Node"; // Your custom EC2 node component
import CircleNode from "./nodes/tools/CircleNode";
import RectangleNode from "./nodes/tools/RectangleNode";

const nodeTypes = {
  ec2: EC2Node,
  rectangle: RectangleNode,
  circle: CircleNode,
};

// function is pure and will never change, if u put in the main component it will rerender everytime
function mapItemToNodeType(name: string): string {
  if (name.includes("Rectangle")) return "rectangle";
  if (name.includes("Circle")) return "circle";
  if (name.includes("EC2")) return "ec2";
  return "default";
}

export default function Canvas() {
  const { nodes, edges, setNodes, setEdges, addNode, addEdge, selectedTool } =
    useDiagramStore();

  // using hook to reference to canvas
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add connection as a new edge
  const onConnect = (params: Edge | Connection) => {
    addEdge(params);
  };

  const onCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      // Only create nodes when a shape tool is selected
      if (selectedTool !== "rectangle" && selectedTool !== "circle") return;

      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      const newNode: Node = {
        id: crypto.randomUUID(),
        type: selectedTool, // either 'rectangle' or 'circle'
        position,
        data: {
          label: selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1), // "Rectangle"
        },
      };

      addNode(newNode);
    },
    [selectedTool, addNode]
  );

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

      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      // Only allow EC2 for now

      const type = mapItemToNodeType(itemData.name);

      if (!["rectangle", "circle", "ec2"].includes(type)) return;

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: {
          ...itemData,
          label: itemData.name,
        },
      };
      console.log("Dropped node:", newNode);
      addNode(newNode);
    },
    [addNode]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.cursor = "not-allowed";
    console.log("Canvas is : ", canvas?.style.cursor);

    console.log("Clicked canvas with tool:", selectedTool);
    console.log("Adding node:", nodes);
  }, [selectedTool]);

  return (
    <ReactFlowProvider>
      <div className="w-full h-full" ref={canvasRef}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={setNodes}
          onEdgesChange={setEdges}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onPaneClick={onCanvasClick}
          className="bg-[#020817]"
          nodeTypes={nodeTypes}
          fitView
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
          <Background gap={11} size={1} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
