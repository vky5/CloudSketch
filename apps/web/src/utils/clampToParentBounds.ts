import { AnyNodeProps } from "@/utils/types/resource";
import { vpcData } from "@/config/awsNodes/vpc.config";

interface ClampOptions {
  parentNode: AnyNodeProps<vpcData>; // VPC Node or any other use union if to add other
  nodeWidth: number;
  nodeHeight: number;
}

/**
 * Clamp a position to stay inside parent VPC bounds
 */
export function clampToParent(
  position: { x: number; y: number },
  options: ClampOptions
): { x: number; y: number } {
  const { parentNode, nodeWidth, nodeHeight } = options;

  const padding = 10; // optional inner padding
  const minX = parentNode.position!.x + padding;
  const minY = parentNode.position!.y + padding;
  const maxX =
    parentNode.position!.x + (parentNode.width ?? 200) - nodeWidth - padding;
  const maxY =
    parentNode.position!.y + (parentNode.height ?? 120) - nodeHeight - padding;

  const clampedX = Math.min(Math.max(position.x, minX), maxX);
  const clampedY = Math.min(Math.max(position.y, minY), maxY);

  return { x: clampedX, y: clampedY };
}
