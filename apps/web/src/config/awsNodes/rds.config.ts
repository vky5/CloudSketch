import { NodeField } from "@/utils/types/NodeField";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";

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
    options: ["mysql", "postgres", "mariadb", "oracle-se2", "sqlserver-ex"],
    required: true,
  },
  {
    key: "EngineVersion",
    label: "Engine Version",
    type: "text",
    placeholder: "e.g., 14.7 (for Postgres) or 8.0 (for MySQL)",
    required: false,
  },
  {
    key: "InstanceClass",
    label: "Instance Class",
    type: "dropdown",
    options: ["db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large"],
    required: true,
  },
  {
    key: "AllocatedStorage",
    label: "Allocated Storage (GB)",
    type: "number",
    placeholder: "e.g., 20",
    required: true,
  },
  {
    key: "DBName",
    label: "Database Name",
    type: "text",
    placeholder: "e.g., mydatabase",
    required: true,
  },
  {
    key: "MasterUsername",
    label: "Master Username",
    type: "text",
    placeholder: "e.g., admin",
    required: true,
  },
  {
    key: "MasterPassword",
    label: "Master Password",
    type: "text",
    placeholder: "e.g., SuperSecret123!",
    required: true,
  },
  {
    key: "SecurityGroups",
    label: "Security Groups",
    type: "multiselect",
    get options() {
      return useTerraformResourceStore
        .getState()
        .resources.filter((sg) => sg.type === "securitygroup" && sg.data?.Name)
        .map((sg) => sg.data.Name);
    },
  },
  {
    key: "SubnetID",
    label: "Subnet",
    type: "dropdown",
    placeholder: "Optional subnet ID",
    required: false,
  },
  {
    key: "Port",
    label: "Port",
    type: "number",
    placeholder: "e.g., 3306 for MySQL, 5432 for Postgres",
    required: false,
  },
  {
    key: "TagName",
    label: "Tag Name",
    type: "text",
    placeholder: "e.g., DatabaseServer",
    required: false,
  },
];

// WHne you write this options: useTerraformStore.getState().resource...
// it populates only once when the schema is first imported
// for get() every time your form code accesses field.options, the getter runs fresh, pulling the latest store state.

// When I say “first imported”, I mean the first time the module file itself is evaluated by the JS runtime, not when you render a component.

/*
// nodeSchemas.ts
export const rdsSchema = {
  fields: [
    {
      key: "SecurityGroups",
      label: "Security Groups",
      type: "multiselect",
      options: useTerraformResourceStore
        .getState()
        .resources.filter((r) => r.type === "securitygroup")
        .map((r) => r.data.Name),
    },
  ],
};

What happens:

The moment any file imports rdsSchema, the whole object is created.
1. That includes evaluating the .options expression right there.
2. From that point onward, options is just a static array baked into the object.
3. It does not re-run when you later render a form or when the store changes, because JS al

*/
