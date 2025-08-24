import { ebsData } from "@/config/awsNodes/ebs.config";
import { ec2Data } from "@/config/awsNodes/ec2.config";
import { rdsData } from "@/config/awsNodes/rds.config";
import { s3Data } from "@/config/awsNodes/s3.config";
import { Node, NodeProps } from "@xyflow/react";

export interface ResourceBlock {
  id: string;
  type: string;
  data: ebsData | ec2Data | rdsData | s3Data;
}

export type AnyNode = Node<ResourceBlock["data"]>;

// we are omiting data property and implementing our own from the generic type we passed
export type AnyNodeProps<T> = Omit<NodeProps, "data"> & {
  // & is for intersection of types
  data: T;
};
