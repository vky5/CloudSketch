import EC2EBS from "./ec2-ebs";
import { resourceBlock } from "@/utils/types/resource";
// import EC2S3 from "./ec2-s3";

const connectionHandler: Record<
  connectionKeys,
  (sourceNode: resourceBlock, destinationNode: resourceBlock) => Promise<any>
> = {
  ec2ebs: EC2EBS,
  // ec2s3: EC2S3,
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

export function serializeConnectionOrder(
  a: resourceBlock,
  b: resourceBlock
): { source: resourceBlock; target: resourceBlock } {
  const canonical: Record<string, string[]> = {
    ec2: ["ebs"],
  };

  if (canonical[a.type]?.includes(b.type)) {
    return { source: a, target: b };
  }

  if (canonical[b.type]?.includes(a.type)) {
    return { source: b, target: a };
  }

  return { source: a, target: b };
}
