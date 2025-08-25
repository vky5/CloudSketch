import EC2EBS from "./ec2-ebs";
import { ResourceBlock } from "@/utils/types/resource";
import EC2S3 from "./ec2-s3";

const connectionHandler: Record<
  connectionKeys,
  (
    sourceNode: ResourceBlock,
    destinationNode: ResourceBlock
  ) => Promise<unknown>
> = {
  ec2ebs: EC2EBS,
  ec2s3: EC2S3,
};

export default function connectionLogic(
  key: connectionKeys | null,
  sourceNode: ResourceBlock,
  destinationNode: ResourceBlock
) {
  if (!key) return Promise.resolve();
  const handler = connectionHandler[key];
  if (!handler) return Promise.resolve();
  return handler(sourceNode, destinationNode);
}

export type connectionKeys = "ec2ebs" | "ec2s3";

export function serializeConnectionOrder(
  a: ResourceBlock,
  b: ResourceBlock
): { source: ResourceBlock; target: ResourceBlock } {
  const canonical: Record<string, string[]> = {
    ec2: ["ebs", "s3"],
  };

  if (canonical[a.type]?.includes(b.type)) {
    return { source: a, target: b };
  }

  if (canonical[b.type]?.includes(a.type)) {
    return { source: b, target: a };
  }

  return { source: a, target: b };
}
