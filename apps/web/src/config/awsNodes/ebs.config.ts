import { NodeField } from "@/utils/types/NodeField";

export const ebsFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Volume Name",
    type: "text",
    placeholder: "e.g., my-ebs-volume",
    required: true,
  },
  {
    key: "VolumeType",
    label: "Volume Type",
    type: "dropdown",
    options: ["gp2", "gp3", "io1", "io2", "sc1", "st1"],
    required: true,
  },
  {
    key: "Size",
    label: "Size (GB)",
    type: "number",
    placeholder: "e.g., 20",
    required: true,
  },
  {
    key: "Encrypted",
    label: "Encrypted",
    type: "toggle",
    options: ["no", "yes"],
    required: false,
  },
  {
    key: "DeleteOnTermination",
    label: "Delete on Termination",
    type: "toggle",
    options: ["no", "yes"],
    required: false,
  },
  {
    key: "TagName",
    label: "Tag Name",
    type: "text",
    placeholder: "Optional tag for volume",
    required: false,
  },
];
