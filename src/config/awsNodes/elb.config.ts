import { NodeField } from "@/utils/types/NodeField";

export const elbFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Load Balancer Name",
    type: "text",
    placeholder: "e.g., web-alb",
    required: true,
  },
  {
    key: "Scheme",
    label: "Scheme",
    type: "dropdown",
    options: ["internet-facing", "internal"],
    required: true,
  },
  {
    key: "ListenerPort",
    label: "Listener Port",
    type: "text",
    placeholder: "80",
    required: true,
  },
  {
    key: "TargetPort",
    label: "Target Port",
    type: "text",
    placeholder: "80",
    required: true,
  },
];

export type elbData = {
  Name: string;
  Scheme: "internet-facing" | "internal";
  ListenerPort: string;
  TargetPort: string;
  SubnetID?: string;
  VpcID?: string;
};