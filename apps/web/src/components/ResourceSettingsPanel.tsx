"use client";

import React from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { X, ArrowLeft } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import { formSchemaRegistry } from "@/config/formSchemaRegistry"; // Resource type → form schema mapping
import { useUIPanelStore } from "@/store/useUIPanelStore";

function ResourceSettingsPanel({ editorWidth }: { editorWidth: number }) {
  // Store hooks
  const {
    settingOpenResourceId, // ID of resource whose settings are open
    resources, // All Terraform resources in state
    updateResource, // Function to update resource data
  } = useTerraformResourceStore();

  const { openConfig } = useUIPanelStore(); // For switching to Config panel

  // If no resource is open in settings, hide the panel
  if (!settingOpenResourceId) return null;

  // Find the current resource object
  const resource = resources.find((r) => r.id === settingOpenResourceId);
  if (!resource) return null;

  const resourceType = resource.type!; // Resource type (e.g., aws_instance)
  const formFields = formSchemaRegistry[resourceType] || []; // Fields to render from schema

  // Handles updating a resource property
  const handleChange = (key: string, value: string) => {
    updateResource(settingOpenResourceId, { [key]: value });
  };

  // Renders the correct input type for each field
  const renderField = (field: any) => {
    const currentValue = (resource.data?.[field.key] as string) || "";

    switch (field.type) {
      // Simple text input
      case "text":
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-xs mb-1 font-medium text-gray-300">
              {field.label}
            </label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleChange(field.key, e.target.value)}
              placeholder={field.placeholder || ""}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-xs text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-xs"
            />
          </div>
        );

      // Dropdown (select)
      case "dropdown": {
        let options: string[] = field.options || [];
        return (
          <div key={field.key} className="mb-4">
            <label className="block text-xs mb-1 font-medium text-gray-300">
              {field.label}
            </label>
            <select
              value={currentValue}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="w-full px-3 py-2 bg-[#2a2a2e] text-xs text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {field.label}</option>
              {options.map((opt: string) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }

      // Multi-line textarea
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

      default:
        return null;
    }
  };

  // Handles "Save & Close"
  const handleSaveAndClose = () => {
    openConfig()
  };

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#232329] text-white shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      {/* Header section with Back and Close buttons */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e32]">
        {/* Back button (switch to config panel) */}
        <button
          onClick={() => {
            openConfig();
          }}
          title="Go Back"
          className="text-gray-300 hover:text-white transition flex items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back</span>
        </button>

        {/* Panel Title */}
        <h2 className="text-lg font-semibold">Resource Settings</h2>

        {/* Close panel button */}
        <button
          onClick={closeSettingsorConfig}
          title="Close Resource Settings"
          className="text-red-400 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable content area */}
      <div
        className="p-4 overflow-y-auto flex-1 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Resource ID display */}
        <p className="text-xs mb-4 text-gray-400">
          Resource ID: {settingOpenResourceId}
        </p>

        {/* Render fields if schema exists */}
        {formFields.length === 0 ? (
          <p className="text-sm text-gray-400">
            No settings available for this resource type.
          </p>
        ) : (
          formFields.map(renderField)
        )}
      </div>

      {/* Footer with Save button */}
      <div className="px-4 py-3 border-t border-[#2e2e32]">
        <button
          onClick={handleSaveAndClose}
          className="w-full bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

export default ResourceSettingsPanel;
