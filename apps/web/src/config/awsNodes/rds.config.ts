// import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { NodeField } from "@/utils/types/NodeField";

export const rdsFormSchema: NodeField[] = [
  {
    key: "Name",
    label: "Resource Name",
    type: "text",
    placeholder: "e.g., my-rds-instance",
    required: true,
  },
  {
    key: "Engine",
    label: "Database Engine",
    type: "dropdown",
    options: ["mysql", "postgres", "mariadb", "oracle", "sqlserver"],
    required: true,
  },
  {
    key: "EngineVersion",
    label: "Engine Version",
    type: "text",
    placeholder: "e.g., 14.1",
    required: false,
  },
  {
    key: "InstanceClass",
    label: "Instance Class",
    type: "text",
    placeholder: "e.g., db.t3.micro",
    required: true,
  },
  {
    key: "AllocatedStorage",
    label: "Storage (GB)",
    type: "number",
    placeholder: "e.g., 20",
    required: true,
  },
  {
    key: "DBName",
    label: "Database Name",
    type: "text",
    placeholder: "e.g., mydb",
    required: false,
  },
  {
    key: "MasterUsername",
    label: "Master Username",
    type: "text",
    placeholder: "e.g., admin",
    required: true,
  },
//   {
//     key: "MasterPassword",
//     label: "Master Password",
//     type: "password",
//     placeholder: "********",
//     required: true,
//   },
//   {
//     key: "SecurityGroups",
//     label: "Security Groups",
//     type: "multiselect",
//     get options() {
//       return useTerraformResourceStore
//         .getState()
//         .resources.filter((sg) => sg.type === "securitygroup" && sg.data?.Name)
//         .map((sg) => sg.data.Name);
//     },
//   },
//   {
//     key: "SubnetGroup",
//     label: "DB Subnet Group",
//     type: "dropdown",
//     get options() {
//       return useTerraformResourceStore
//         .getState()
//         .resources.filter((subnet) => subnet.type === "subnetgroup" && subnet.data?.Name)
//         .map((subnet) => subnet.data.Name);
//     },
//   },
  {
    key: "TagName",
    label: "Tag Name",
    type: "text",
    placeholder: "e.g., ProdDB",
    required: false,
  },
];
