import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { NodeField } from "@/utils/types/NodeField";
import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  field: NodeField; // each form part to be rendered
  currentNode: any; // the current value off that form (node.data?.[field.key] as string) || ""
  handleChange: (key: string, value: any) => void;
}

function RenderForm({ field, currentNode, handleChange }: Props) {
  const { resources } = useTerraformResourceStore();
  const currentValue = currentNode;

  switch (field.type) {
    case "text":
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">
            {field.label}
          </label>
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder || ""}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
          />
        </div>
      );

    case "dropdown": {
      let options: string[] = [];

      if (field.dynamicOptionsSource === "securityGroups") {
        options = resources
          .filter((sg) => sg.type === "securitygroup")
          .map((sg) => sg.data.label);
      } else if (field.dynamicOptionsSource === "keyPairs") {
        options = resources
          .filter((kp) => kp.id === "keypair")
          .map((kp) => kp.data.label);
      } else if (field.options) {
        options = field.options;
      }

      return (
        <div key={field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">
            {field.label}
          </label>
          <select
            value={currentValue}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {field.label}</option>
            {options.map((opt: string, idx: number) => (
              <option key={`${field.key}-${idx}`} value={opt}>
                {opt || "Unnamed"}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case "textarea":
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-xs mb-1 font-medium text-gray-300">
            {field.label}
          </label>
          <textarea
            value={currentValue}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder || ""}
            rows={3}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-xs text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs resize-none"
          />
        </div>
      );

    case "number":
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">
            {field.label}
          </label>
          <input
            type="number"
            value={currentValue}
            onChange={(e) =>
              handleChange(
                field.key,
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
            placeholder={field.placeholder || ""}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
          />
        </div>
      );

    case "group": {
      const items = Array.isArray(currentValue) ? currentValue : [];

      const addItem = () => {
        const emptyItem = (field.fields || []).reduce((acc, f) => {
          acc[f.key] = "";
          return acc;
        }, {} as Record<string, any>);
        handleChange(field.key, [...items, emptyItem]);
      };

      const updateItem = (index: number, subKey: string, subValue: any) => {
        const updatedItems = [...items];
        updatedItems[index] = { ...updatedItems[index], [subKey]: subValue };
        handleChange(field.key, updatedItems);
      };

      const removeItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        handleChange(field.key, updatedItems);
      };

      return (
        <div
          key={field.key}
          className="mb-6 border border-[#3b3b3f] rounded-md p-3"
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                {field.label}
              </label>
              {field.description && (
                <p className="text-xs text-gray-400">{field.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center text-[#0EA85D] font-extrabold p-1 rounded-full hover:text-green-700"
              title="Add item"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {items.length === 0 && (
            <p className="text-xs text-gray-500">No {field.label} added yet.</p>
          )}

          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative mb-3 p-3 bg-[#2a2a2e] rounded-md border border-[#3b3b3f]"
            >
              {/* Trash bin in top-right */}
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                title="Remove item"
              >
                <FiTrash2 size={16} />
              </button>

              {(field.fields || []).map((subField) => (
                <RenderForm
                  key={subField.key}
                  field={subField}
                  currentNode={item[subField.key]}
                  handleChange={(subKey, subValue) =>
                    updateItem(idx, subKey, subValue)
                  }
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

export default RenderForm;
