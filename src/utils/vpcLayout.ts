import { AnyNode } from "@/utils/types/resource";
import {
  MIN_VPC_HEIGHT,
  MIN_VPC_WIDTH,
} from "@/utils/getNextSubnetPosition";

export const VPC_GAP = 48;
export const VPC_GRID_START_X = 80;
export const VPC_GRID_START_Y = 80;

export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export function vpcBounds(node: AnyNode): Rect {
  const width = node.width ?? MIN_VPC_WIDTH;
  const height = node.height ?? MIN_VPC_HEIGHT;
  return {
    left: node.position.x,
    top: node.position.y,
    right: node.position.x + width,
    bottom: node.position.y + height,
    width,
    height,
  };
}

export function rectsOverlap(a: Rect, b: Rect, gap = 0): boolean {
  return (
    a.left < b.right + gap &&
    a.right + gap > b.left &&
    a.top < b.bottom + gap &&
    a.bottom + gap > b.top
  );
}

export function vpcsOverlap(a: AnyNode, b: AnyNode, gap = VPC_GAP): boolean {
  return rectsOverlap(vpcBounds(a), vpcBounds(b), gap);
}

function overlapsAnyVpc(
  x: number,
  y: number,
  width: number,
  height: number,
  existingVpcs: AnyNode[],
  gap: number
): boolean {
  const candidate: Rect = {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
  };

  return existingVpcs.some((vpc) => rectsOverlap(candidate, vpcBounds(vpc), gap));
}

/** Find a canvas position for a new VPC that does not overlap existing VPCs. */
export function getNextVpcPosition(
  existingVpcs: AnyNode[],
  vpcWidth: number = MIN_VPC_WIDTH,
  vpcHeight: number = MIN_VPC_HEIGHT
): { x: number; y: number } {
  for (let row = 0; row < 50; row++) {
    for (let col = 0; col < 50; col++) {
      const x = VPC_GRID_START_X + col * (vpcWidth + VPC_GAP);
      const y = VPC_GRID_START_Y + row * (vpcHeight + VPC_GAP);

      if (!overlapsAnyVpc(x, y, vpcWidth, vpcHeight, existingVpcs, VPC_GAP)) {
        return { x, y };
      }
    }
  }

  return { x: VPC_GRID_START_X, y: VPC_GRID_START_Y };
}

function vpcLayoutChanged(prev: AnyNode | undefined, next: AnyNode): boolean {
  if (!prev) return true;
  return (
    prev.position.x !== next.position.x ||
    prev.position.y !== next.position.y ||
    prev.width !== next.width ||
    prev.height !== next.height
  );
}

/** Push `movable` away from `fixed` along the smallest separation axis. */
export function pushVpcAwayFrom(
  fixed: AnyNode,
  movable: AnyNode,
  gap: number = VPC_GAP
): { x: number; y: number } {
  const f = vpcBounds(fixed);
  const m = vpcBounds(movable);

  let newX = movable.position.x;
  let newY = movable.position.y;

  if (!rectsOverlap(f, m, gap)) {
    return { x: newX, y: newY };
  }

  const pushRight = f.right + gap - m.left;
  const pushLeft = m.right + gap - f.left;
  const pushDown = f.bottom + gap - m.top;
  const pushUp = m.bottom + gap - f.top;

  const horizontalPush = Math.min(pushRight, pushLeft);
  const verticalPush = Math.min(pushDown, pushUp);

  if (horizontalPush <= verticalPush) {
    if (pushRight <= pushLeft) {
      newX = f.right + gap;
    } else {
      newX = f.left - m.width - gap;
    }
  } else if (pushDown <= pushUp) {
    newY = f.bottom + gap;
  } else {
    newY = f.top - m.height - gap;
  }

  return { x: newX, y: newY };
}

/**
 * Ensure top-level VPCs never overlap. When one VPC grows (e.g. new subnet row),
 * neighboring VPCs are pushed aside.
 */
export function resolveVpcCollisions(
  nextNodes: AnyNode[],
  prevNodes: AnyNode[]
): AnyNode[] {
  const resolved = nextNodes.map((node) => ({ ...node }));
  const vpcIds = resolved
    .filter((node) => node.type === "vpc" && !node.parentId)
    .map((node) => node.id);

  let changed = true;
  let iterations = 0;

  while (changed && iterations < 30) {
    changed = false;
    iterations += 1;

    for (let i = 0; i < vpcIds.length; i++) {
      for (let j = i + 1; j < vpcIds.length; j++) {
        const a = resolved.find((node) => node.id === vpcIds[i]);
        const b = resolved.find((node) => node.id === vpcIds[j]);
        if (!a || !b || !vpcsOverlap(a, b)) continue;

        const prevA = prevNodes.find((node) => node.id === a.id);
        const prevB = prevNodes.find((node) => node.id === b.id);
        const aChanged = vpcLayoutChanged(prevA, a);
        const bChanged = vpcLayoutChanged(prevB, b);

        let fixed = a;
        let movable = b;

        const aIsNew = !prevA;
        const bIsNew = !prevB;

        if (aIsNew && !bIsNew) {
          fixed = a;
          movable = b;
        } else if (bIsNew && !aIsNew) {
          fixed = b;
          movable = a;
        } else if (bChanged && !aChanged) {
          fixed = b;
          movable = a;
        } else if (aChanged && bChanged) {
          if (b.dragging && !a.dragging) {
            fixed = b;
            movable = a;
          } else if (a.dragging && !b.dragging) {
            fixed = a;
            movable = b;
          } else {
            const aGrowth =
              (a.width ?? MIN_VPC_WIDTH) * (a.height ?? MIN_VPC_HEIGHT) -
              (prevA?.width ?? MIN_VPC_WIDTH) * (prevA?.height ?? MIN_VPC_HEIGHT);
            const bGrowth =
              (b.width ?? MIN_VPC_WIDTH) * (b.height ?? MIN_VPC_HEIGHT) -
              (prevB?.width ?? MIN_VPC_WIDTH) * (prevB?.height ?? MIN_VPC_HEIGHT);
            if (bGrowth > aGrowth) {
              fixed = b;
              movable = a;
            }
          }
        }

        const newPos = pushVpcAwayFrom(fixed, movable);
        const movableIndex = resolved.findIndex((node) => node.id === movable.id);
        if (movableIndex === -1) continue;

        if (
          resolved[movableIndex].position.x !== newPos.x ||
          resolved[movableIndex].position.y !== newPos.y
        ) {
          resolved[movableIndex] = {
            ...resolved[movableIndex],
            position: { x: newPos.x, y: newPos.y },
          };
          changed = true;
        }
      }
    }
  }

  return resolved;
}