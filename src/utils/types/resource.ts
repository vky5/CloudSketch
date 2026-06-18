import { ebsData } from "@/config/awsNodes/ebs.config";
import { ec2Data } from "@/config/awsNodes/ec2.config";
import { rdsData } from "@/config/awsNodes/rds.config";
import { s3Data } from "@/config/awsNodes/s3.config";
import { subnetData } from "@/config/awsNodes/subnet.config";
import { vpcData } from "@/config/awsNodes/vpc.config";
import { ebsAttachData } from "@/config/resources/ebs_attach";

export type Ec2S3AttachData = {
  Name: string;
  EC2NodeID: string;
  BucketID: string;
};
import { iamData } from "@/config/resources/iam.config";
import { instanceProfileData } from "@/config/resources/instanceprofile.config";
import { keyPairData } from "@/config/resources/keypair.config";
import { SecurityGroupData } from "@/config/resources/sg.config";
import { Node, NodeProps } from "@xyflow/react";

export type LambdaData = {
  id: string;
  Name: string;
  runtime: string;
  memory: string;
};

export type ToolNodeData = {
  id: string;
};

export interface ResourceBlock {
  id: string;
  type: string;
  data:
    | ebsData
    | ec2Data
    | rdsData
    | s3Data
    | iamData
    | keyPairData
    | SecurityGroupData
    | instanceProfileData
    | ebsData
    | ebsAttachData
    | vpcData
    | subnetData
    | LambdaData
    | ToolNodeData
    | Ec2S3AttachData;
}

export type AnyNode = Node<ResourceBlock["data"]>;

export function getResourceName(data: ResourceBlock["data"]): string | undefined {
  return "Name" in data && typeof data.Name === "string" ? data.Name : undefined;
}

// we are omiting data property and implementing our own from the generic type we passed
export type AnyNodeProps<T> = Omit<NodeProps, "data"> & {
  // & is for intersection of types
  data: T;
  position?: { x: number; y: number };
};

export interface ResourceBlockSpecific<TDATA> {
  id: string;
  type: string;
  data: TDATA;
}
