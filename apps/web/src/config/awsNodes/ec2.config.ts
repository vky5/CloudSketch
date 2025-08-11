import { NodeField } from "@/utils/types/NodeField";

export const ec2FormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Resource Name",
    type: "text",
    placeholder: "e.g., my-ec2-instance",
    required: true,
  },
  {
    key: "AMI",
    label: "AMI ID",
    type: "text",
    placeholder: "e.g., ami-12345678",
    required: true,
  },
  {
    key: "InstanceType",
    label: "Instance Type",
    type: "text",
    placeholder: "e.g., t2.micro",
    required: true,
  },
  {
    key: "SecurityGroups",
    label: "Security Groups",
    type: "dropdown",
    dynamicOptionsSource: "securityGroups",
  },
  {
    key: "KeyName",
    label: "Key Pair",
    type: "dropdown",
    dynamicOptionsSource: "keyPairs",
  },
  {
    key: "SubnetID",
    label: "Subnet",
    type: "dropdown",
    placeholder: "Optional subnet ID",
    required: false,
  },
  {
    key: "TagName",
    label: "Tag Name",
    type: "text",
    placeholder: "e.g., WebServer",
    required: false,
  },
];
