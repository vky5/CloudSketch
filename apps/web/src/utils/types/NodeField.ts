type FieldType = "text" | "textarea" | "dropdown" | "checkbox" | "number";

export interface NodeField {
  key: string;                // internal key in node.data
  label: string;              // label shown in UI
  type: FieldType;            // input type
  placeholder?: string;
  required?: boolean;
  options?: string[];         // for dropdowns
  description?: string;       // help text
  dynamicOptionsSource?: "securityGroups" | "keyPairs"; // for dynamic dropdowns
}
