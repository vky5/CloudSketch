import { NodeField } from "@/utils/types/NodeField";
import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  field: NodeField;
  currentNode: any; // value from resource.data[field.key]
  handleChange: (key: string, value: any) => void;
}

function RenderForm({ field, currentNode, handleChange }: Props) {
  // Determine the "safe" current value based on field type
  const currentValue =
    currentNode ??
    (field.type === "multiselect" || field.type === "multitext" || field.type === "group"
      ? []
      : "");

  switch (field.type) {
    case "text":
    case "textarea":
    case "number":
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">
            {field.label}
          </label>
          {field.type === "textarea" ? (
            <textarea
              value={currentValue}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder || ""}
              rows={3}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-xs text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs resize-none"
            />
          ) : (
            <input
              type={field.type === "number" ? "number" : "text"}
              value={currentValue}
              onChange={(e) =>
                handleChange(
                  field.key,
                  field.type === "number"
                    ? e.target.value === ""
                      ? ""
                      : Number(e.target.value)
                    : e.target.value
                )
              }
              placeholder={field.placeholder || ""}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
            />
          )}
        </div>
      );

    case "dropdown": {
      const options: string[] = field.options || [];
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
            {options.map((opt, idx) => (
              <option key={`${field.key}-${idx}`} value={opt}>
                {opt || "Unnamed"}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case "multiselect": {
      const selectedOptions: string[] = Array.isArray(currentValue) ? currentValue : [];
      const toggleOption = (option: string) =>
        handleChange(
          field.key,
          selectedOptions.includes(option)
            ? selectedOptions.filter((o) => o !== option)
            : [...selectedOptions, option]
        );

      const hasOptions = Array.isArray(field.options) && field.options.length > 0;
      return (
        <div key={field.key} className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">{field.label}</label>
          {hasOptions ? (
            <div className="flex flex-wrap gap-2">
              {field.options!.map((option, idx) => {
                const isSelected = selectedOptions.includes(option);
                return (
                  <button
                    key={`${field.key}-${idx}`}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      isSelected
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-[#2a2a2e] border-[#3b3b3f] text-gray-300 hover:bg-blue-500 hover:text-white"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="w-full px-3 py-2 bg-[#1f1f23] text-gray-500 text-xs rounded-md border border-[#3b3b3f] italic">
              No options available
            </div>
          )}
        </div>
      );
    }

    case "multitext": {
      const items: string[] = Array.isArray(currentValue) ? currentValue : [];
      const addItem = () => handleChange(field.key, [...items, ""]);
      const updateItem = (index: number, value: string) => {
        const updated = [...items];
        updated[index] = value;
        handleChange(field.key, updated);
      };
      const removeItem = (index: number) =>
        handleChange(field.key, items.filter((_, i) => i !== index));

      return (
        <div key={field.key} className="mb-6 border border-[#3b3b3f] rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">{field.label}</label>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center justify-center text-[#0EA85D] font-extrabold p-1 rounded-full hover:text-green-700"
              title="Add item"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {items.length === 0 && <p className="text-xs text-gray-500">No {field.label} added yet.</p>}

          {items.map((item, idx) => (
            <div key={idx} className="relative mb-3 p-2 bg-[#2a2a2e] rounded-md border border-[#3b3b3f]">
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
                title="Remove item"
              >
                <FiTrash2 size={16} />
              </button>

              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                placeholder={field.placeholder || ""}
                className="w-full px-3 py-1 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
              />
            </div>
          ))}
        </div>
      );
    }

    case "group": {
      const items: Record<string, any>[] = Array.isArray(currentValue) ? currentValue : [];

      const addItem = () => {
        const emptyItem = (field.fields || []).reduce((acc, f) => {
          acc[f.key] = "";
          return acc;
        }, {} as Record<string, any>);
        handleChange(field.key, [...items, emptyItem]);
      };

      const updateItem = (index: number, subKey: string, subValue: any) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [subKey]: subValue };
        handleChange(field.key, updated);
      };

      const removeItem = (index: number) => {
        handleChange(field.key, items.filter((_, i) => i !== index));
      };

      return (
        <div key={field.key} className="mb-6 border border-[#3b3b3f] rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <label className="block text-sm font-medium text-gray-300">{field.label}</label>
              {field.description && <p className="text-xs text-gray-400">{field.description}</p>}
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

          {items.length === 0 && <p className="text-xs text-gray-500">No {field.label} added yet.</p>}

          {items.map((item, idx) => (
            <div key={idx} className="relative mb-3 p-3 bg-[#2a2a2e] rounded-md border border-[#3b3b3f]">
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
                  handleChange={(subKey, subValue) => updateItem(idx, subKey, subValue)}
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
