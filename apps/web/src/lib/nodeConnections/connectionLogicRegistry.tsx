import EC2EBS from "./ec2-ebs";
import { resourceBlock } from "@/utils/types/resource";

const connectionHandler: Record<
  connectionKeys,
  (sourceNode: resourceBlock, destinationNode: resourceBlock) => Promise<any>
> = {
  ec2ebs: EC2EBS,
};

export default function connectionLogic(
  key: connectionKeys | null,
  sourceNode: resourceBlock,
  destinationNode: resourceBlock
) {
  if (!key) return Promise.resolve();
  const handler = connectionHandler[key];
  if (!handler) return Promise.resolve(); // this is fallback mechanism
  return handler(sourceNode, destinationNode);
}

export type connectionKeys = "ec2ebs";
