import { NodeField } from "@/utils/types/NodeField";

export const egressRuleFields: NodeField[] = [
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
    placeholder: "e.g., 80",
  },
  {
    key: "ToPort",
    label: "To Port",
    type: "number",
    required: true,
    placeholder: "e.g., 80",
  },
  {
    key: "CidrIPv4",
    label: "CIDR IPv4",
    type: "text",
    required: true,
    placeholder: "0.0.0.0/0",
  },
  {
    key: "CidrIPv6",
    label: "CIDR IPv6",
    type: "text",
    required: false,
    placeholder: "::/0",
  },
];
