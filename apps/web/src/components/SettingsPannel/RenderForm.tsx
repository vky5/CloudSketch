import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { NodeField } from "@/utils/types/NodeField";
import React from "react";

interface props {
  field: NodeField; // each form part to be rendered
  currentNode: any; // the current value off that form (node.data?.[field.key] as string) || ""
  handleChange: (key: string, value: string) => void;
}

function RenderForm(props: props) {
  const { resources } = useTerraformResourceStore();
  const currentValue = props.currentNode;

  switch (props.field.type) {
    case "text":
      return (
        <div key={props.field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">
            {props.field.label}
          </label>
          <input
            type="text"
            value={currentValue}
            onChange={(e) =>
              props.handleChange(props.field.key, e.target.value)
            }
            placeholder={props.field.placeholder || ""}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
          />
        </div>
      );

    case "dropdown": {
      let options: string[] = [];

      if (resources.length === 0) {
        // do nothing
      } else if (props.field.dynamicOptionsSource === "securityGroups") {// these are from the dynamicOptionSource, chnaged its appearence so u wont get confuse
        options = resources.map((sg) =>
          sg.type === "securitygroup" ? sg.data.label : ""
        );
      } else if (props.field.dynamicOptionsSource === "keyPairs") {
        options = resources.map((kp) =>
          kp.id === "keypair" ? kp.data.label : ""
        );
      }

      return (
        <div key={props.field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">
            {props.field.label}
          </label>
          <select
            value={currentValue}
            onChange={(e) =>
              props.handleChange(props.field.key, e.target.value)
            }
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {props.field.label}</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case "textarea":
      return (
        <div key={props.field.key} className="mb-4">
          <label className="block text-xs mb-1 font-medium text-gray-300">
            {props.field.label}
          </label>
          <textarea
            value={currentValue}
            onChange={(e) =>
              props.handleChange(props.field.key, e.target.value)
            }
            placeholder={props.field.placeholder || ""}
            rows={3}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-xs text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs resize-none"
          />
        </div>
      );

    default:
      return null;
  }
}

export default RenderForm;
