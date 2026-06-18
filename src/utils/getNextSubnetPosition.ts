import { AnyNodeProps } from "@/utils/types/resource";
import { subnetData } from "@/config/awsNodes/subnet.config";

export const SUBNET_GRID_COLS = 4;
export const SUBNET_PADDING = 24;
export const SUBNET_GAP = 16;
export const SUBNET_TOP_PADDING = 36;
export const SUBNET_BOTTOM_PADDING = 24;
export const DEFAULT_SUBNET_WIDTH = 260;
export const DEFAULT_SUBNET_HEIGHT = 180;
export const MIN_VPC_WIDTH =
  SUBNET_PADDING * 2 +
  SUBNET_GRID_COLS * DEFAULT_SUBNET_WIDTH +
  (SUBNET_GRID_COLS - 1) * SUBNET_GAP;
export const MIN_VPC_HEIGHT = 400;

function gridPosition(
  slot: number,
  subnetWidth: number,
  subnetHeight: number
): { x: number; y: number } {
  const col = slot % SUBNET_GRID_COLS;
  const row = Math.floor(slot / SUBNET_GRID_COLS);
  return {
    x: SUBNET_PADDING + col * (subnetWidth + SUBNET_GAP),
    y: SUBNET_TOP_PADDING + row * (subnetHeight + SUBNET_GAP),
  };
}

function rectanglesOverlap(
  ax: number,
  ay: number,
  aw: number,
  ah: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function slotOverlapsExisting(
  slot: number,
  existingSubnets: AnyNodeProps<subnetData>[],
  subnetWidth: number,
  subnetHeight: number
): boolean {
  const { x, y } = gridPosition(slot, subnetWidth, subnetHeight);

  return existingSubnets.some((subnet) => {
    const sx = subnet.position?.x ?? 0;
    const sy = subnet.position?.y ?? 0;
    const sw = subnet.width ?? subnetWidth;
    const sh = subnet.height ?? subnetHeight;
    return rectanglesOverlap(x, y, subnetWidth, subnetHeight, sx, sy, sw, sh);
  });
}

/**
 * Place subnets in a 4-column grid inside the VPC (parent-relative coords):
 *   A  B  C  D
 *   E  F  G  H
 *   I  J  ...
 */
export function getNextSubnetPosition(
  _parentVpc: AnyNodeProps<unknown>,
  existingSubnets: AnyNodeProps<subnetData>[],
  subnetWidth: number = DEFAULT_SUBNET_WIDTH,
  subnetHeight: number = DEFAULT_SUBNET_HEIGHT
): { x: number; y: number } {
  let slot = existingSubnets.length;

  while (slotOverlapsExisting(slot, existingSubnets, subnetWidth, subnetHeight)) {
    slot += 1;
  }

  return gridPosition(slot, subnetWidth, subnetHeight);
}

/** Minimum VPC size required to fit a subnet placed at `pos` without clipping. */
export function getVpcSizeForSubnetPosition(
  pos: { x: number; y: number },
  subnetWidth: number = DEFAULT_SUBNET_WIDTH,
  subnetHeight: number = DEFAULT_SUBNET_HEIGHT
): { width: number; height: number } {
  const col = Math.floor((pos.x - SUBNET_PADDING) / (subnetWidth + SUBNET_GAP)) + 1;
  const row = Math.floor((pos.y - SUBNET_TOP_PADDING) / (subnetHeight + SUBNET_GAP)) + 1;
  const colsUsed = Math.min(SUBNET_GRID_COLS, Math.max(1, col));

  const width =
    SUBNET_PADDING * 2 +
    colsUsed * subnetWidth +
    (colsUsed - 1) * SUBNET_GAP;

  const height =
    SUBNET_TOP_PADDING +
    SUBNET_BOTTOM_PADDING +
    row * subnetHeight +
    (row - 1) * SUBNET_GAP;

  return {
    width: Math.max(MIN_VPC_WIDTH, width),
    height: Math.max(MIN_VPC_HEIGHT, height),
  };
}

/** Minimum VPC size to contain all existing subnets plus one new grid slot. */
export function getVpcSizeForSubnetCount(
  subnetCount: number,
  subnetWidth: number = DEFAULT_SUBNET_WIDTH,
  subnetHeight: number = DEFAULT_SUBNET_HEIGHT
): { width: number; height: number } {
  if (subnetCount <= 0) {
    return { width: MIN_VPC_WIDTH, height: MIN_VPC_HEIGHT };
  }

  const rows = Math.ceil(subnetCount / SUBNET_GRID_COLS);
  const colsUsed = Math.min(SUBNET_GRID_COLS, subnetCount);

  const width =
    SUBNET_PADDING * 2 +
    colsUsed * subnetWidth +
    (colsUsed - 1) * SUBNET_GAP;

  const height =
    SUBNET_TOP_PADDING +
    SUBNET_BOTTOM_PADDING +
    rows * subnetHeight +
    (rows - 1) * SUBNET_GAP;

  return {
    width: Math.max(MIN_VPC_WIDTH, width),
    height: Math.max(MIN_VPC_HEIGHT, height),
  };
}

/** Bounding box size needed to contain all subnet children (any positions). */
export function getVpcSizeForSubnetChildren(
  children: Array<Pick<AnyNodeProps<subnetData>, "position" | "width" | "height">>,
  subnetWidth: number = DEFAULT_SUBNET_WIDTH,
  subnetHeight: number = DEFAULT_SUBNET_HEIGHT
): { width: number; height: number } {
  if (children.length === 0) {
    return { width: MIN_VPC_WIDTH, height: MIN_VPC_HEIGHT };
  }

  let maxRight = 0;
  let maxBottom = 0;

  children.forEach((child) => {
    const x = child.position?.x ?? SUBNET_PADDING;
    const y = child.position?.y ?? SUBNET_TOP_PADDING;
    const w = child.width ?? subnetWidth;
    const h = child.height ?? subnetHeight;
    maxRight = Math.max(maxRight, x + w + SUBNET_PADDING);
    maxBottom = Math.max(maxBottom, y + h + SUBNET_BOTTOM_PADDING);
  });

  return {
    width: Math.max(MIN_VPC_WIDTH, maxRight),
    height: Math.max(MIN_VPC_HEIGHT, maxBottom),
  };
}

export const SUBNET_CHILD_WIDTH = 176;
export const SUBNET_CHILD_HEIGHT = 52;
const SUBNET_CHILD_PADDING_X = 16;
const SUBNET_CHILD_PADDING_Y = 40;
const SUBNET_CHILD_GAP = 12;
const SUBNET_CHILD_COLS = 2;

/** Place compute / ALB children in a simple grid inside a subnet (parent-relative). */
export function getNextSubnetChildPosition(
  existingChildren: Array<{
    position?: { x: number; y: number };
    width?: number;
    height?: number;
  }>,
  childWidth: number = SUBNET_CHILD_WIDTH,
  childHeight: number = SUBNET_CHILD_HEIGHT
): { x: number; y: number } {
  const slot = existingChildren.length;
  const col = slot % SUBNET_CHILD_COLS;
  const row = Math.floor(slot / SUBNET_CHILD_COLS);

  return {
    x: SUBNET_CHILD_PADDING_X + col * (childWidth + SUBNET_CHILD_GAP),
    y: SUBNET_CHILD_PADDING_Y + row * (childHeight + SUBNET_CHILD_GAP),
  };
}