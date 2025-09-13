import { NodeField } from "@/utils/types/NodeField";

export const vpcFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "VPC Name",
    type: "text",
    placeholder: "e.g., MyVPC",
    required: true,
  },
  {
    key: "CIDR",
    label: "CIDR Block",
    type: "text",
    placeholder: "e.g., 10.0.0.0/16",
    required: true,
  },
  {
    key: "EnableDNS",
    label: "Enable DNS Hostnames",
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

export type vpcData = {    
  Name: string; // e.g., "MyVPC"
  CIDR: string; // e.g., "10.0.0.0/16"
  EnableDNS?: "yes" | "no"; // optional toggle
  Tags?: string; // optional tags
};
