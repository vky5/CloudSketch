// importing all nodes
import EC2Node from "../nodes/awsNodes/EC2Node";
import RhombusNode from "../nodes/tools/RhombusNode";
import RectangleNode from "../nodes/tools/RectangleNode";
import TextNode from "../nodes/tools/TextNode";
import LambdaNode from "../nodes/awsNodes/LambdaNode";
import RDSNode from "../nodes/awsNodes/RDSNode";
import S3Node from "../nodes/awsNodes/S3Node";
import EBSNode from "../nodes/awsNodes/EBSNode";
import { ebsData } from "@/config/awsNodes/ebs.config";
import { ec2Data } from "@/config/awsNodes/ec2.config";
import { rdsData } from "@/config/awsNodes/rds.config";
import { s3Data } from "@/config/awsNodes/s3.config";
import VPCNode from "../nodes/awsNodes/VPCNode";
import { vpcData } from "@/config/awsNodes/vpc.config";
import SubnetNode from "../nodes/awsNodes/SubnetNode";
import { subnetData } from "@/config/awsNodes/subnet.config";

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
};

export function getDefaultDataForNode(
  type: string
): ebsData | ec2Data | rdsData | s3Data | vpcData | subnetData {
  switch (type.toLowerCase()) {
    case "ebs":
      return { Name: "", VolumeType: "gp2", Size: 0 };
    case "ec2":
      return { Name: "", AMI: "", InstanceType: "" };
    case "rds":
      return {
        Name: "",
        Engine: "mysql",
        InstanceClass: "db.t3.micro",
        AllocatedStorage: 20,
        DBName: "",
        MasterUsername: "",
        MasterPassword: "",
      };
    case "s3":
      return { Name: "" };
    case "vpc":
      return {
        Name: "",
        CIDR: "",
        EnableDNS: "yes",
        Tags: "",
      };
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}
