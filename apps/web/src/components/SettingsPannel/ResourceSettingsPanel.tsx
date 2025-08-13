"use client";

import React from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { X, ArrowLeft } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";
import { formSchemaRegistry } from "@/config/formSchemaRegistry"; // Resource type → form schema mapping
import { useUIPanelStore } from "@/store/useUIPanelStore";
import { syncNodeWithBackend } from "@/utils/terraformSync";
import RenderForm from "./RenderForm";

function ResourceSettingsPanel({ editorWidth }: { editorWidth: number }) {
  const { settingOpenResourceId, resources, updateResource } =
    useTerraformResourceStore();

  const { openConfig } = useUIPanelStore();

  // If no resource is open in settings, hide the panel
  if (!settingOpenResourceId) return null;

  // Find the current resource object
  const resource = resources.find((r) => r.id === settingOpenResourceId);
  if (!resource) return null;
  console.log(resource)

  const resourceType = resource.type!; // Resource type (e.g., keypair)
  const formFields = formSchemaRegistry[resourceType] || []; // Fields to render from schema

  // Handles updating a resource property
  const handleChange = (key: string, value: string) => {
    updateResource(settingOpenResourceId, { [key]: value });
  };

  // Handles "Save & Close"
  const handleSaveAndClose = async () => {
    await syncNodeWithBackend({
      id: resource.id,
      data: resource.data,
      type: resource.type,
    });
    openConfig();
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
          formFields.map((field) => (
            <RenderForm
              key={field.key}
              field={field}
              currentNode={(resource.data?.[field.key] as string) || ""}
              handleChange={handleChange}
            />
          ))
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
