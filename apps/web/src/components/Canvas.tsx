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
  NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDiagramStore } from "@/store/useDiagramStore";
import { nodeTypes, getDefaultDataForNode } from "./Canvas/nodeTypes";
import GhostRectangle from "./nodes/ghosts/GhostRectangle";
import GhostRhombus from "./nodes/ghosts/GhostRhombus";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import canConnect, { keyGen } from "@/config/connectionsConfig";
import connectionLogic, {
  serializeConnectionOrder,
} from "@/lib/nodeConnections/connectionLogicRegistry";
import { ResourceBlock } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";

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
    updateNodePosition,
  } = useDiagramStore();

  // using hook to reference to canvas
  const canvasRef = useRef<HTMLDivElement>(null); // TODO remove it if not in use till end
  const ghostRef = useRef<HTMLDivElement>(null); // instead of triggering rerendering by passing in x, y position to ghost components, we ar gonna use ref to
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const { screenToFlowPosition } = useReactFlow();

  // for selection and drawing the selection rectangle
  useEffect(() => {
    if (selectedTool !== "select") return;

    const canvas = canvasRef.current;
    const selectionBox = selectionBoxRef.current;
    if (!canvas || !selectionBox) return;

    let isSelecting = false;
    let startX = 0;
    let startY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      selectionBox.style.left = `${startX}px`;
      selectionBox.style.top = `${startY}px`;
      selectionBox.style.width = "0px";
      selectionBox.style.height = "0px";
      selectionBox.style.display = "block";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;
      const currentX = e.clientX;
      const currentY = e.clientY;
      const rectLeft = Math.min(startX, currentX);
      const rectTop = Math.min(startY, currentY);
      const rectWidth = Math.abs(startX - currentX);
      const rectHeight = Math.abs(startY - currentY);

      selectionBox.style.left = `${rectLeft}px`;
      selectionBox.style.top = `${rectTop}px`;
      selectionBox.style.width = `${rectWidth}px`;
      selectionBox.style.height = `${rectHeight}px`;
    };
    const onMouseUp = () => {
      isSelecting = false;
      selectionBox.style.display = "none";

      const selectionRect = selectionBox.getBoundingClientRect();

      // Compute selected nodes
      const selected = nodes.filter((node) => {
        const nodeRect = document
          .querySelector(`[data-id='${node.id}']`)
          ?.getBoundingClientRect();
        if (!nodeRect) return false;

        const isInside =
          nodeRect.left >= selectionRect.left &&
          nodeRect.right <= selectionRect.right &&
          nodeRect.top >= selectionRect.top &&
          nodeRect.bottom <= selectionRect.bottom;

        return isInside;
      });

      const selectedIds = selected.map((node) => node.id);
      selectNodes(selectedIds);
      console.log("Selected node IDs:", selectedIds);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [selectedTool, nodes, selectNodes]);

  // Track the mouse position for ghost movement
  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const moveGhost = () => {
      // set the movement of the ghost component
      const ghost = ghostRef.current; // if ghost ref is attached to any component which it will be the selected tool is in renderGhostShape function
      if (ghost) {
        ghost.style.left = `${mousePos.current.x}px`; // setting the x and y position
        ghost.style.top = `${mousePos.current.y}px`;
      }
      requestAnimationFrame(moveGhost); // this is browser API, // TODO add the similar logic to moving the node by clicking on it from one positionn to another
    };

    window.addEventListener("mousemove", updatePosition);
    requestAnimationFrame(moveGhost);

    return () => {
      window.removeEventListener("mousemove", updatePosition);
    };
  }, []);

  function renderGhostShape(tool: string) {
    switch (tool) {
      case "rectangle":
        return <GhostRectangle ref={ghostRef} />;
      case "rhombus":
        return <GhostRhombus ref={ghostRef} />;
      // Add more cases like "circle", "ec2", etc.
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

  // this is just adding the node to canvas, done by adding to Node array in state and rest everything does reactflow
  const handlePaneClick = useCallback(
    async (event: React.MouseEvent) => {
      const validNodeTypes = Object.keys(nodeTypes);
      if (!validNodeTypes.includes(selectedTool)) return;

      const { clientX, clientY } = event;
      const position = screenToFlowPosition({ x: clientX, y: clientY });

      const newNode: Node<ResourceBlock["data"]> = {
        // this a generic created explicitley for data type!?? that makes total sense and we are accessing data type from reosurceblock
        id: crypto.randomUUID(),
        type: selectedTool || "unknown",
        position,
        draggable: false,
        data: getDefaultDataForNode(selectedTool),
      };

      try {
        await syncNodeWithBackend({
          id: newNode.id,
          type: newNode.type!,
          data: newNode.data,
        }); // Wait for backend response before adding
        addNode(newNode);
        selectedNode(newNode.id);
        setSelectedTool("hand");
      } catch (err) {
        console.error("Failed to sync with backend:", err);
        // TODO show error toast or disable node addition
      }
    },
    [selectedTool, screenToFlowPosition, addNode, selectedNode, setSelectedTool]
  );

  // this is a utility to count the number of renders remove it
  useEffect(() => console.log("Rendered"), []);

  // DUNNO what this one does
  const memoizedNodes = useMemo(() => {
    return nodes.map((node) => {
      let extent: [[number, number], [number, number]] | undefined;

      // Calculate extent for subnet nodes
      if (node.type === "subnet") {
        const subnetData = node.data as subnetData;
        const parentVpc = nodes.find(
          (n) => n.type === "vpc" && n.id === subnetData.parentVpcId
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
        extent, // This is ReactFlow's built-in constraint system
      };
    });
  }, [nodes, selectedNodeId]);

  // Add connection as a new edge
  // Hook into React Flow onConnect
  const onConnect = useCallback(
    async (params: Edge | Connection) => {
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (!sourceNode || !targetNode) return;

      if (!sourceNode.type || !targetNode.type) {
        console.warn("One of the nodes has no type, skipping connection");
        return;
      }

      // Validate connection first
      if (!canConnect(sourceNode.type, targetNode.type)) {
        alert(`❌ Cannot connect ${sourceNode.type} to ${targetNode.type}`);
        return;
      }

      const sourceBlock: ResourceBlock = {
        id: sourceNode.id,
        type: sourceNode.type,
        data: sourceNode.data as ResourceBlock["data"],
      };

      const targetBlock: ResourceBlock = {
        id: targetNode.id,
        type: targetNode.type,
        data: targetNode.data as ResourceBlock["data"],
      };

      const { source, target } = serializeConnectionOrder(
        sourceBlock,
        targetBlock
      );

      const key = keyGen(source.type, target.type);

      try {
        await connectionLogic(
          key,
          { id: source.id, type: source.type, data: source.data },
          { id: target.id, type: target.type, data: target.data }
        );

        addEdge(params); // only add edge if no error
      } catch (err: any) {
        // Show alert with error message and red cross
        alert(`❌ ${err.message}`);
      }
    },
    [nodes, addEdge]
  );

  // when node is clicked select it
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      console.log("Node clicked:", node.id);
      selectedNode(node.id); // to select the node for opening settings
    },
    [selectedNode]
  );

  // Helper function to check if two rectangles overlap
  const doRectanglesOverlap = (rect1: any, rect2: any) => {
    return !(
      (
        rect1.x + rect1.width <= rect2.x || // rect1 is left of rect2
        rect2.x + rect2.width <= rect1.x || // rect2 is left of rect1
        rect1.y + rect1.height <= rect2.y || // rect1 is above rect2
        rect2.y + rect2.height <= rect1.y
      ) // rect2 is above rect1
    );
  };

  // Helper function to find a non-overlapping position
  const findNonOverlappingPosition = (
    movingNode: Node,
    newPosition: { x: number; y: number },
    otherSubnets: Node[],
    vpcBounds: { minX: number; minY: number; maxX: number; maxY: number }
  ) => {
    const nodeWidth = movingNode.width ?? 160;
    const nodeHeight = movingNode.height ?? 100;
    const padding = 5; // Small gap between nodes

    let testPosition = { ...newPosition };

    // Check if the new position would cause overlap
    const wouldOverlap = otherSubnets.some((subnet) => {
      if (!subnet.position) return false;

      const subnetWidth = subnet.width ?? 160;
      const subnetHeight = subnet.height ?? 100;

      return doRectanglesOverlap(
        {
          x: testPosition.x,
          y: testPosition.y,
          width: nodeWidth,
          height: nodeHeight,
        },
        {
          x: subnet.position.x,
          y: subnet.position.y,
          width: subnetWidth,
          height: subnetHeight,
        }
      );
    });

    if (!wouldOverlap) {
      return testPosition; // No overlap, position is fine
    }

    // If overlap detected, try to find alternative positions
    const step = 20; // Move in 20px increments

    // Try moving right first
    for (
      let offsetX = step;
      offsetX <= vpcBounds.maxX - testPosition.x;
      offsetX += step
    ) {
      const candidatePos = { x: testPosition.x + offsetX, y: testPosition.y };

      if (candidatePos.x + nodeWidth > vpcBounds.maxX) break;

      const hasOverlap = otherSubnets.some((subnet) => {
        if (!subnet.position) return false;
        const subnetWidth = subnet.width ?? 160;
        const subnetHeight = subnet.height ?? 100;

        return doRectanglesOverlap(
          {
            x: candidatePos.x,
            y: candidatePos.y,
            width: nodeWidth,
            height: nodeHeight,
          },
          {
            x: subnet.position.x,
            y: subnet.position.y,
            width: subnetWidth,
            height: subnetHeight,
          }
        );
      });

      if (!hasOverlap) {
        return candidatePos;
      }
    }

    // Try moving down
    for (
      let offsetY = step;
      offsetY <= vpcBounds.maxY - testPosition.y;
      offsetY += step
    ) {
      const candidatePos = { x: testPosition.x, y: testPosition.y + offsetY };

      if (candidatePos.y + nodeHeight > vpcBounds.maxY) break;

      const hasOverlap = otherSubnets.some((subnet) => {
        if (!subnet.position) return false;
        const subnetWidth = subnet.width ?? 160;
        const subnetHeight = subnet.height ?? 100;

        return doRectanglesOverlap(
          {
            x: candidatePos.x,
            y: candidatePos.y,
            width: nodeWidth,
            height: nodeHeight,
          },
          {
            x: subnet.position.x,
            y: subnet.position.y,
            width: subnetWidth,
            height: subnetHeight,
          }
        );
      });

      if (!hasOverlap) {
        return candidatePos;
      }
    }

    // If no good position found, return the original node position
    return movingNode.position || testPosition;
  };

  // OnNodeChangeHandler
  const onNodesChangeHandler = useCallback(
    (changes: NodeChange[]) => {
      // Process position changes with overlap prevention
      const processedChanges = changes.map((change) => {
        if (change.type === "position" && change.position) {
          const node = nodes.find((n) => n.id === change.id);

          if (node?.type === "subnet") {
            const subnetData = node.data as subnetData;
            const parentVpc = nodes.find(
              (n) => n.type === "vpc" && n.id === subnetData.parentVpcId
            );

            if (parentVpc?.position) {
              // Get VPC bounds - account for node size in collision detection
              const padding = 10;
              const nodeWidth = node.width ?? 160;
              const nodeHeight = node.height ?? 100;
              const vpcBounds = {
                minX: parentVpc.position.x + padding,
                minY: parentVpc.position.y + padding,
                maxX:
                  parentVpc.position.x +
                  (parentVpc.width ?? 200) -
                  nodeWidth -
                  padding,
                maxY:
                  parentVpc.position.y +
                  (parentVpc.height ?? 120) -
                  nodeHeight -
                  padding,
              };

              // Get other subnet nodes in the same VPC
              const otherSubnets = nodes.filter(
                (n) =>
                  n.type === "subnet" &&
                  n.id !== change.id &&
                  (n.data as subnetData).parentVpcId === subnetData.parentVpcId
              );

              // Find non-overlapping position
              const adjustedPosition = findNonOverlappingPosition(
                node,
                change.position,
                otherSubnets,
                vpcBounds
              );

              return {
                ...change,
                position: adjustedPosition,
              };
            }
          }
        }
        return change;
      });

      setNodes(processedChanges);
    },
    [setNodes, nodes]
  );

  // for logging purpose remove if no need
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log("Canvas is : ", canvas?.style.cursor);

    console.log("Clicked canvas with tool:", selectedTool);
    console.log("Adding node:", nodes);
  }, [selectedTool, nodes]);

  // useless functions
  const onNodeDragStart = useCallback(() => {
    console.log("Node drag started");
  }, []);

  // FIXME Fix this section to update the subnetid 
  const onNodeDragStop = useCallback(
    async (event: React.MouseEvent, node: Node) => {
      if (node.type !== "subnet") return;

      const subnetData = node.data as subnetData;
      const parentVpc = nodes.find(
        (n) => n.type === "vpc" && n.id === subnetData.parentVpcId
      );
      if (!parentVpc?.position) return;

      const padding = 10;
      const nodeWidth = node.width ?? 160;
      const nodeHeight = node.height ?? 100;
      const vpcBounds = {
        minX: parentVpc.position.x + padding,
        minY: parentVpc.position.y + padding,
        maxX:
          parentVpc.position.x + (parentVpc.width ?? 200) - nodeWidth - padding,
        maxY:
          parentVpc.position.y +
          (parentVpc.height ?? 120) -
          nodeHeight -
          padding,
      };

      const otherSubnets = nodes.filter(
        (n) =>
          n.type === "subnet" &&
          n.id !== node.id &&
          (n.data as subnetData).parentVpcId === subnetData.parentVpcId
      );

      const newPos = findNonOverlappingPosition(
        node,
        node.position!,
        otherSubnets,
        vpcBounds
      );

      if (newPos.x !== node.position!.x || newPos.y !== node.position!.y) {
        // 1. Update local store
        updateNodePosition(node.id, newPos.x, newPos.y);

        // 2. Sync with backend
        try {
          await syncNodeWithBackend({
            id: node.id,
            type: node.type!,
            data: {
              ...(node.data as ResourceBlock["data"]),
            },
          });
        } catch (err) {
          console.error("Failed to sync subnet position with backend:", err);
        }
      }
    },
    [nodes, updateNodePosition]
  );

  return (
    <div className="w-full h-full overflow-hidden" ref={canvasRef}>
      <ReactFlow
        fitView={false}
        // defaultZoom={1}
        nodes={memoizedNodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={setEdges}
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
