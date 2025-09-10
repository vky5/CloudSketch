import { ebsData } from "@/config/awsNodes/ebs.config";
import { useDiagramStore } from "@/store/useDiagramStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import { ResourceBlock, ResourceBlockSpecific } from "@/utils/types/resource";

export default async function EC2EBS(
  sourceNode: ResourceBlock,
  destinationNode: ResourceBlock
): Promise<void> {
  const ebsNode = destinationNode as ResourceBlockSpecific<ebsData>;

  // Throw error if EBS is already connected
  if (ebsNode.data.connectedTo) {
    throw new Error(
      `EBS "${ebsNode.data.Name}" is already connected to EC2 "${ebsNode.data.connectedTo}"`
    );
  }

  // Attach EBS to EC2
  const id = crypto.randomUUID();

  useDiagramStore
    .getState()
    .updateNodeData(destinationNode.id, { connectedTo: sourceNode.id });

  await syncNodeWithBackend({
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

// we added connectedTo field in EBS to track if it is connected to any ec2 if it is already connected leave it as it is 
