import { NodeField } from "@/utils/types/NodeField";

export const subnetFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Subnet Name",
    type: "text",
    placeholder: "e.g., PublicSubnet1",
    required: true,
  },
  {
    key: "CIDR",
    label: "CIDR Block",
    type: "text",
    placeholder: "e.g., 10.0.1.0/24",
    required: true,
  },
  {
    key: "AvailabilityZone",
    label: "Availability Zone",
    type: "text",
    placeholder: "e.g., us-east-1a",
    required: false, // optional but nice to have
  },
  {
    key: "MapPublicIpOnLaunch",
    label: "Auto-assign Public IP",
    type: "toggle",
    options: ["yes", "no"],
    required: false,
  },
  {
    key: "Tags",
    label: "Tags",
    type: "text",
    placeholder: "Optional tags",
    required: false,
  },
];

export type subnetData = {
  uuid: string; // fixed internal ID, used as Terraform block label
  parentVpcId: string; // reference back to parent VPC node
  Name: string; // e.g., "PublicSubnet1"
  CIDR: string; // e.g., "10.0.1.0/24"
  AvailabilityZone?: string; // e.g., "us-east-1a"
  MapPublicIpOnLaunch?: "yes" | "no";
  Tags?: string;
};
