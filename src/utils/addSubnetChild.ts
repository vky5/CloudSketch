import { getDefaultDataForNode } from "@/components/Canvas/nodeTypes";
import { elbData } from "@/config/awsNodes/elb.config";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { useDiagramStore } from "@/store/useDiagramStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import {
  getNextSubnetChildPosition,
  SUBNET_CHILD_HEIGHT,
  SUBNET_CHILD_WIDTH,
} from "@/utils/getNextSubnetPosition";
import { AnyNode } from "@/utils/types/resource";

export type SubnetChildType = "ec2" | "rds" | "elb";

const DEFAULT_NAMES: Record<SubnetChildType, string> = {
  ec2: "EC2 Instance",
  rds: "RDS Database",
  elb: "Load Balancer",
};

export async function addSubnetChild(
  subnetId: string,
  childType: SubnetChildType
): Promise<void> {
  const { nodes, addNode, selectedNode } = useDiagramStore.getState();
  const subnetNode = nodes.find((n) => n.id === subnetId);
  if (!subnetNode) return;

  const existingChildren = nodes.filter((n) => n.parentId === subnetId);
  const position = getNextSubnetChildPosition(existingChildren);
  const childId = crypto.randomUUID();
  const data = getDefaultDataForNode(childType, childId);

  if ("SubnetID" in data) {
    (data as { SubnetID?: string }).SubnetID = subnetId;
  }

  if (childType === "elb") {
    const vpcId = (subnetNode.data as subnetData).parentVpcId;
    if (vpcId) {
      (data as elbData).VpcID = vpcId;
    }
  }

  if ("Name" in data && typeof data.Name === "string" && !data.Name) {
    data.Name = DEFAULT_NAMES[childType];
  }

  const newNode: AnyNode = {
    id: childId,
    type: childType,
    position,
    parentId: subnetId,
    width: SUBNET_CHILD_WIDTH,
    height: SUBNET_CHILD_HEIGHT,
    data,
    draggable: true,
    selectable: true,
    deletable: true,
    selected: false,
    zIndex: 10,
  };

  await syncNodeWithBackend({ id: childId, type: childType, data });
  addNode(newNode);
  selectedNode(childId);
}