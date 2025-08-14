import { NodeField } from "@/utils/types/NodeField";

export const iamFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Role Name",
    type: "text",
    required: true,
    placeholder: "my-ec2-role",
  },
  {
    key: "Services",
    label: "Services",
    type: "multiselect",
    options: [
      "ec2.amazonaws.com",
      "lambda.amazonaws.com",
      "ecs-tasks.amazonaws.com",
      "rds.amazonaws.com",
    ],
    placeholder: "Select one or more services",
  },
  {
    key: "ManagedPolicies",
    label: "Managed Policies",
    type: "multiselect",
    options: [
      "arn:aws:iam::aws:policy/AmazonS3FullAccess",
      "arn:aws:iam::aws:policy/AmazonRDSFullAccess",
      "arn:aws:iam::aws:policy/AmazonEC2FullAccess",
    ],
    placeholder: "Select one or more managed policies",
  },
  {
    key: "CustomPolicies",
    label: "Custom Policies",
    type: "multitext",
    placeholder: "arn:aws:iam::aws:policy/YourCustomPolicy",
  }
];
