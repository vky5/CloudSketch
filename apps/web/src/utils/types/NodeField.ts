type FieldType =
  | "text"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "number"
  | "group"
  | "multiselect"
  | "multitext";

export interface NodeField {
  key: string; // internal key in node.data (used by backend to link the data to the struct)
  label: string; // label shown in UI
  type: FieldType; // input type
  placeholder?: string;
  required?: boolean;
  options?: string[]; // for dropdowns
  description?: string; // help text
  fields?: NodeField[];
}
