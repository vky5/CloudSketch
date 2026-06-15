import { NodeField } from "@/utils/types/NodeField";

export const ingressRuleFields: NodeField[] = [
  {
    key: "Protocol",
    label: "Protocol",
    type: "dropdown",
    options: ["tcp", "udp", "icmp", "-1"],
    required: true,
  },
  {
    key: "FromPort",
    label: "From Port",
    type: "number",
    required: true,
    placeholder: "e.g., 22",
  },
  {
    key: "ToPort",
    label: "To Port",
    type: "number",
    required: true,
    placeholder: "e.g., 22",
  },
  {
    key: "CidrIPv4",
    label: "CIDR IPv4",
    type: "text",
    required: true,
    placeholder: "e.g., 0.0.0.0/0",
  },
  {
    key: "CidrIPv6",
    label: "CIDR IPv6",
    type: "text",
    required: false,
    placeholder: "::/0",
  },

];


export type IngressRuleData = {
  Protocol: "tcp" | "udp" | "icmp" | "-1"; // allowed protocols
  FromPort: number;                        // starting port
  ToPort: number;                          // ending port
  CidrIPv4: string;                        // IPv4 CIDR block
  CidrIPv6?: string;                       // optional IPv6 CIDR block
};
