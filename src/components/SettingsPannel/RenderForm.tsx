"use client";

import { NodeField } from "@/utils/types/NodeField";
import React from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface Props {
  field: NodeField;
  currentNode: unknown;
  handleChange: (value: unknown) => void;
}

const inputClassName =
  "w-full h-9 rounded-lg border border-slate-700/50 bg-[#161b26] px-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";

const textareaClassName =
  "w-full min-h-[88px] resize-none rounded-lg border border-slate-700/50 bg-[#161b26] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20";

function RenderForm({ field, currentNode, handleChange }: Props) {
  const currentValue =
    currentNode ??
    (["multiselect", "multitext", "group"].includes(field.type) ? [] : "");

  const renderLabel = (label: string) => (
    <label className="mb-1.5 block text-xs font-medium text-slate-400">
      {label}
      {field.required && <span className="ml-1 text-rose-400">*</span>}
    </label>
  );

  switch (field.type) {
    case "text":
    case "textarea":
    case "number":
      return (
        <div className="space-y-1.5">
          {renderLabel(field.label)}
          {field.type === "textarea" ? (
            <textarea
              value={String(currentValue ?? "")}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder || ""}
              rows={3}
              className={textareaClassName}
            />
          ) : (
            <input
              type={field.type === "number" ? "number" : "text"}
              value={String(currentValue ?? "")}
              onChange={(e) =>
                handleChange(
                  field.type === "number" && e.target.value !== ""
                    ? Number(e.target.value)
                    : e.target.value
                )
              }
              placeholder={field.placeholder || ""}
              className={inputClassName}
            />
          )}
        </div>
      );

    case "dropdown": {
      const options: string[] = field.options || [];
      return (
        <div className="space-y-1.5">
          {renderLabel(field.label)}
          <select
            value={String(currentValue ?? "")}
            onChange={(e) => handleChange(e.target.value)}
            className={`${inputClassName} cursor-pointer`}
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
        <div className="space-y-2">
          {renderLabel(field.label)}
          <div className="flex flex-wrap gap-1.5">
            {(field.options || []).map((option, idx) => {
              const isSelected = selected.includes(option);
              return (
                <button
                  key={`${field.key}-${idx}`}
                  type="button"
                  onClick={() => toggleOption(option)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200"
                      : "border-slate-700/50 bg-[#161b26] text-slate-400 hover:border-slate-600 hover:text-slate-200"
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
        <div className="rounded-lg border border-slate-800/70 bg-[#131820]/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            {renderLabel(field.label)}
            <button
              type="button"
              onClick={addItem}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
              title="Add item"
            >
              <FiPlus size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateItem(idx, e.target.value)}
                  className={inputClassName}
                />
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="shrink-0 rounded-md p-2 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }

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
        <div className="rounded-lg border border-slate-800/70 bg-[#131820]/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            {renderLabel(field.label)}
            <button
              type="button"
              onClick={addItem}
              className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
            >
              <FiPlus size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="relative space-y-3 rounded-lg border border-slate-800/60 bg-[#161b26]/50 p-3"
              >
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="absolute right-2 top-2 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <FiTrash2 size={14} />
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
        </div>
      );
    }

    case "toggle": {
      const options: string[] = field.options || ["Off", "On"];
      const value = currentValue ?? options[0];
      const toggle = () =>
        handleChange(value === options[0] ? options[1] : options[0]);

      return (
        <div className="flex items-center justify-between gap-4 py-0.5">
          {renderLabel(field.label)}
          <button
            type="button"
            onClick={toggle}
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              value === options[1] ? "bg-indigo-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                value === options[1] ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      );
    }

    default:
      return null;
  }
}

export default RenderForm;