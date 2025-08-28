import EC2EBS from "./ec2-ebs";
import { ResourceBlock } from "@/utils/types/resource";
import EC2S3 from "./ec2-s3";
import { ResourceBlockSpecific } from "@/utils/types/resource";
import { ec2Data } from "@/config/awsNodes/ec2.config";
import { s3Data } from "@/config/awsNodes/s3.config";
import { ebsData } from "@/config/awsNodes/ebs.config";

const connectionHandler = {
  ec2ebs: EC2EBS as (
    source: ResourceBlockSpecific<ec2Data>,
    destination: ResourceBlockSpecific<ebsData>
  ) => Promise<unknown>,
  ec2s3: EC2S3 as (
    source: ResourceBlockSpecific<ec2Data>,
    destination: ResourceBlockSpecific<s3Data>
  ) => Promise<unknown>,
};

export default function connectionLogic(
  key: connectionKeys | null,
  sourceNode: ResourceBlock,
  destinationNode: ResourceBlock
) {
  if (!key) return Promise.resolve();

  switch (key) {
    case "ec2ebs":
      return connectionHandler.ec2ebs(
        sourceNode as ResourceBlockSpecific<ec2Data>,
        destinationNode as ResourceBlockSpecific<ebsData>
      );
    case "ec2s3":
      return connectionHandler.ec2s3(
        sourceNode as ResourceBlockSpecific<ec2Data>,
        destinationNode as ResourceBlockSpecific<s3Data>
      );
    default:
      return Promise.resolve();
  }
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
