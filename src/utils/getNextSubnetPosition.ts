import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";

interface Bounds {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Get the next valid position for a subnet inside a VPC (parent-relative)
 */
export function getNextSubnetPosition(
  parentVpc: AnyNodeProps<unknown>, // vpc node itself
  existingSubnets: AnyNodeProps<subnetData>[],
  subnetWidth: number,
  subnetHeight: number,
  canvasBounds: Bounds // whole canvas
): { x: number; y: number } {
  const padding = 24;
  const gap = 16;
  const topPadding = 36; // Leave space for VPC header

  const cols = Math.max(1, Math.floor((parentVpc.width! - padding * 2) / (subnetWidth + gap)));
  const rows = Math.max(1, Math.floor((parentVpc.height! - topPadding - padding) / (subnetHeight + gap)));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = padding + c * (subnetWidth + gap);
      const y = topPadding + r * (subnetHeight + gap);

      const overlaps = existingSubnets.some(
        (s) =>
          Math.abs(s.position!.x - x) < subnetWidth &&
          Math.abs(s.position!.y - y) < subnetHeight
      );

      if (!overlaps) {
        return { x, y };
      }
    }
  }

  // fallback
  return {
    x: padding,
    y: topPadding,
  };
}
