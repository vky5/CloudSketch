import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock } from "@/utils/types/resource";

export default function EC2EBS(
  sourceNode: ResourceBlock,
  destinationNode: ResourceBlock
) {
  const id = crypto.randomUUID();
  return syncNodeWithBackend({
    id: id,
    type: "ec2ebs",
    data: {
      Name: id,
      EC2NodeID: sourceNode.id,
      VolumeID: destinationNode.id,
      DeviceName: "/dev/sdf",
    },
  });
}

// we are assuming that EC2 -> EBS meaning source node and destination node respectly
