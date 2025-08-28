import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
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
    type: "multiselect",
    get options() {
      return useTerraformResourceStore
        .getState()
        .resources.filter((sg) => sg.type === "securitygroup" && sg.data?.Name)
        .map((sg) => sg.data.Name);
    },
  },
  {
    key: "KeyName",
    label: "Key Pair",
    type: "dropdown",
    get options() {
      return useTerraformResourceStore
        .getState()
        .resources.filter((kp) => kp.type === "keypair" && kp.data?.Name)
        .map((kp) => kp.data.Name);
    },
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

export type ec2Data = {
  Name: string; // Resource Name
  AMI: string; // AMI ID
  InstanceType: string; // e.g., t2.micro
  SecurityGroups?: string[]; // optional multiselect
  KeyName?: string; // optional dropdown
  SubnetID?: string; // optional
  TagName?: string; // optional
  InstanceProfile?: string;
};
