"use Client";

import { NodeField } from "@/utils/types/NodeField";
import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  field: NodeField;
  currentNode: unknown;
  handleChange: (value: unknown) => void;
}

function RenderForm({ field, currentNode, handleChange }: Props) {
  // default/fallback values
  const currentValue =
    currentNode ??
    (["multiselect", "multitext", "group"].includes(field.type) ? [] : "");

  const renderLabel = (label: string) => (
    <label className="block text-sm mb-1 font-medium text-gray-300">
      {label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
  switch (field.type) {
    /** ────────────── Text / Textarea / Number ────────────── */
    case "text":
    case "textarea":
    case "number":
      return (
        <div className="mb-4">
          {renderLabel(field.label)}
          {field.type === "textarea" ? (
            <textarea
              value={String(currentValue ?? "")}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder || ""}
              rows={3}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-xs text-white rounded-md border border-[#3b3b3f] focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <input
              type={field.type === "number" ? "number" : "text"}
              value={
                field.type === "number"
                  ? String(currentValue ?? "")
                  : String(currentValue ?? "")
              }
              onChange={(e) =>
                handleChange(
                  field.type === "number" && e.target.value !== ""
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              placeholder={field.placeholder || ""}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      );

    /** ────────────── Dropdown ────────────── */
    case "dropdown": {
      const options: string[] = field.options || [];
      return (
        <div className="mb-4">
          {renderLabel(field.label)}
          <select
            value={String(currentValue ?? "")}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:ring-2 focus:ring-blue-500"
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

    /** ────────────── Multi-select ────────────── */
    case "multiselect": {
      const selected: string[] = Array.isArray(currentValue)
        ? currentValue
        : [];
      const toggleOption = (option: string) =>
        handleChange(
          selected.includes(option)
            ? selected.filter((o) => o !== option)
            : [...selected, option]
        );

      return (
        <div className="mb-4">
          {renderLabel(field.label)}
          <div className="flex flex-wrap gap-2">
            {(field.options || []).map((option, idx) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={`${field.key}-${idx}`}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={`px-3 py-1 text-xs rounded-md border ${
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
        </div>
      );
    }

    /** ────────────── Multi-text ────────────── */
    case "multitext": {
      const items: string[] = Array.isArray(currentValue) ? currentValue : [];
      const addItem = () => handleChange([...items, ""]);
      const updateItem = (i: number, v: string) => {
        const updated = [...items];
        updated[i] = v;
        handleChange(updated);
      };
      const removeItem = (i: number) =>
        handleChange(items.filter((_, x) => x !== i));

      return (
        <div className="mb-6 border border-[#3b3b3f] rounded-md p-3">
          <div className="flex justify-between items-center mb-2">
            {renderLabel(field.label)}
            <button
              type="button"
              onClick={addItem}
              className="text-[#0EA85D] p-1 rounded-full hover:text-green-700"
              title="Add item"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative mb-3 p-2 bg-[#2a2a2e] rounded-md"
            >
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
              >
                <FiTrash2 size={16} />
              </button>
              <input
                type="text"
                value={item}
                onChange={(e) => updateItem(idx, e.target.value)}
                className="w-full px-3 py-1 bg-[#2a2a2e] text-white text-xs rounded-md border border-[#3b3b3f] focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      );
    }

    /** ────────────── Group ────────────── */
    case "group": {
      const items: Record<string, unknown>[] = Array.isArray(currentNode)
        ? currentNode
        : [];

      const addItem = () => {
        const empty = (field.fields || []).reduce((acc, f) => {
          acc[f.key] = "";
          return acc;
        }, {} as Record<string, unknown>);
        handleChange([...items, empty]);
      };

      const updateItem = (i: number, k: string, v: unknown) => {
        const updated = [...items];
        updated[i] = { ...updated[i], [k]: v };
        handleChange(updated);
      };

      const removeItem = (i: number) =>
        handleChange(items.filter((_, x) => x !== i));

      return (
        <div className="mb-6 border border-[#3b3b3f] rounded-md p-3">
          <div className="flex justify-between mb-2">
            {renderLabel(field.label)}
            <button
              type="button"
              onClick={addItem}
              className="text-[#0EA85D] p-1 rounded-full hover:text-green-700"
            >
              <FiPlus size={16} />
            </button>
          </div>

          {items.map((item, idx) => (
            <div
              key={idx}
              className="relative mb-3 p-3 bg-[#2a2a2e] rounded-md"
            >
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="absolute top-2 right-2 text-red-400 hover:text-red-600"
              >
                <FiTrash2 size={16} />
              </button>
              {(field.fields || []).map((sub) => (
                <RenderForm
                  key={sub.key}
                  field={sub}
                  currentNode={item[sub.key]}
                  handleChange={(val) => updateItem(idx, sub.key, val)}
                />
              ))}
            </div>
          ))}
        </div>
      );
    }

    /** ────────────── Toggle ────────────── */
    case "toggle": {
      const options: string[] = field.options || ["Off", "On"];
      const value = currentValue ?? options[0];
      const toggle = () =>
        handleChange(value === options[0] ? options[1] : options[0]);

      return (
        <div className="mb-4 flex items-center justify-between">
          {renderLabel(field.label)}
          <div
            onClick={toggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              value === options[1] ? "bg-blue-600" : "bg-gray-700"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                value === options[1] ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

export default RenderForm;
