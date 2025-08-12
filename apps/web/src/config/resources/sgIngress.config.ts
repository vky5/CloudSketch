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
    key: "CidrBlocks",
    label: "CIDR IPv4",
    type: "text",
    required: true,
    placeholder: "e.g., 0.0.0.0/0",
  },
  {
    key: "Ipv6CidrBlocks",
    label: "CIDR IPv6",
    type: "text",
    required: false,
    placeholder: "::/0",
  },
  {
    key: "Description",
    label: "Rule Description",
    type: "text",
    required: false,
    placeholder: "Optional note for this rule",
  },
];
