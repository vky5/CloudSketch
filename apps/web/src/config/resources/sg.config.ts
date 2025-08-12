import { NodeField } from "@/utils/types/NodeField";
// import { ingressRuleFields } from "./sgIngress.config";
// import { egressRuleFields } from "./sgEgress.config";

export const securityGroupFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Security Group Name",
    type: "text",
    placeholder: "e.g., my-security-group",
    required: true,
  },
  {
    key: "Description",
    label: "Description",
    type: "textarea",
    placeholder: "Brief description of this security group",
    required: true,
  },
  {
    key: "Tags",
    label: "Tags",
    type: "textarea",
    placeholder: "e.g., Key=Value pairs in JSON or comma separated",
    required: false,
  },
//   {
//     key: "IngressRules",
//     label: "Inbound Rules",
//     type: "group",
//     description: "Add one or more inbound rules",
//     required: false,
//     fields: ingressRuleFields,
//   },
//   {
//     key: "EgressRules",
//     label: "Outbound Rules",
//     type: "group",
//     description: "Add one or more outbound rules",
//     required: false,
//     fields: egressRuleFields,
//   },
];
