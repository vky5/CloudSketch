import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";

export default function EC2EBS(
  sourceNode: ResourceBlock,
  destinationNode: ResourceBlock
) {
  return syncNodeWithBackend({
    id: crypto.randomUUID(),
    type: "ec2ebs",
    data: {
      EC2NodeID: sourceNode.id,
      VolumeID: destinationNode.id,
      DeviceName: "/dev/sdf",
    },
  });
}

// we are assuming that EC2 -> EBS meaning source node and destination node respectly
