import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";

interface Bounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Get the next valid position for a subnet inside a VPC
 */
export function getNextSubnetPosition(
  parentVpc: AnyNodeProps<unknown>, // vpc node itself
  existingSubnets: AnyNodeProps<subnetData>[],
  subnetWidth: number,
  subnetHeight: number,
  canvasBounds: Bounds // whole canvas (0,0,w,h)
): { x: number; y: number } {
  const padding = 20; // padding inside vpc
  const cols = Math.floor(
    (parentVpc.width! - padding * 2) / subnetWidth
  );

  const rows = Math.floor(
    (parentVpc.height! - padding * 2) / subnetHeight
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = parentVpc.position!.x + padding + c * subnetWidth;
      const y = parentVpc.position!.y + padding + r * subnetHeight;

      const overlaps = existingSubnets.some(
        (s) =>
          Math.abs(s.position!.x - x) < subnetWidth &&
          Math.abs(s.position!.y - y) < subnetHeight
      );

      const insideCanvas =
        x + subnetWidth < canvasBounds.x + canvasBounds.width &&
        y + subnetHeight < canvasBounds.y + canvasBounds.height;

      if (!overlaps && insideCanvas) {
        return { x, y };
      }
    }
  }

  // fallback → put it at top-left inside VPC if grid is "full"
  return {
    x: parentVpc.position!.x + padding,
    y: parentVpc.position!.y + padding,
  };
}
