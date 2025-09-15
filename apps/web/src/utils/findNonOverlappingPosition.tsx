import { Node } from "@xyflow/react";

export const findNonOverlappingPosition = (
  movingNode: Node,
  newPosition: { x: number; y: number },
  otherSubnets: Node[],
  vpcBounds: { minX: number; minY: number; maxX: number; maxY: number }
) => {
  const nodeWidth = movingNode.width ?? 160;
  const nodeHeight = movingNode.height ?? 100;

  const testPosition = { ...newPosition };

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

// Helper function to check if two rectangles overlap
export const doRectanglesOverlap = (rect1: Rectangle, rect2: Rectangle) => {
  return !(
    (
      rect1.x + rect1.width <= rect2.x || // rect1 is left of rect2
      rect2.x + rect2.width <= rect1.x || // rect2 is left of rect1
      rect1.y + rect1.height <= rect2.y || // rect1 is above rect2
      rect2.y + rect2.height <= rect1.y
    ) // rect2 is above rect1
  );
};

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}
