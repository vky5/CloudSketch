// importing all nodes
import EC2Node from "../nodes/awsNodes/EC2Node";
import RhombusNode from "../nodes/tools/RhombusNode";
import RectangleNode from "../nodes/tools/RectangleNode";
import TextNode from "../nodes/tools/TextNode";
import LambdaNode from "../nodes/awsNodes/LambdaNode";
import RDSNode from "../nodes/awsNodes/RDSNode";
import S3Node from "../nodes/awsNodes/S3Node";
import EBSNode from "../nodes/awsNodes/EBSNode";
import VPCNode from "../nodes/awsNodes/VPCNode";
import SubnetNode from "../nodes/awsNodes/SubnetNode";
import CircleNode from "../nodes/tools/CircleNode";
import ELBNode from "../nodes/awsNodes/ELBNode";
import { ResourceBlock } from "@/utils/types/resource";

export const nodeTypes = {
  ec2: EC2Node,
  rectangle: RectangleNode,
  rhombus: RhombusNode,
  text: TextNode,
  lambda: LambdaNode,
  rds: RDSNode,
  s3: S3Node,
  ebs: EBSNode,
  vpc: VPCNode,
  subnet: SubnetNode,
  circle: CircleNode,
  elb: ELBNode,
};

export function getDefaultDataForNode(
  type: string,
  id: string
): ResourceBlock["data"] {
  switch (type.toLowerCase()) {
    case "ebs":
      return { id, Name: "", VolumeType: "gp2", Size: 0 };
    case "ec2":
      return { id, Name: "", AMI: "", InstanceType: "" };
    case "rds":
      return {
        id,
        Name: "",
        Engine: "mysql",
        InstanceClass: "db.t3.micro",
        AllocatedStorage: 20,
        DBName: "",
        MasterUsername: "",
        MasterPassword: "",
      };
    case "s3":
      return { id, Name: "" };
    case "vpc":
      return {
        id,
        Name: "",
        CIDR: "",
        EnableDNS: "yes",
        Tags: "",
      };
    case "subnet":
      return {
        id,
        uuid: crypto.randomUUID(),
        parentVpcId: "",
        Name: "",
        CIDR: "",
        AvailabilityZone: "",
        MapPublicIpOnLaunch: "no",
        Tags: "",
      };
    case "lambda":
      return {
        id,
        Name: "",
        runtime: "nodejs18.x",
        memory: "128MB",
      };
    case "elb":
      return {
        id,
        Name: "",
        Scheme: "internet-facing",
        ListenerPort: "80",
        TargetPort: "80",
      };
    case "rectangle":
    case "rhombus":
    case "text":
    case "circle":
      return { id };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}
