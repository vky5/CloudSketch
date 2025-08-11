"use client";

import React from "react";
import { useTerraformResourceStore } from "@/store/useTerraformResourceStore";
import { X } from "lucide-react";
import closeSettingsorConfig from "@/utils/closeSettingsorConfig";

function ResourceSettingsPanel({ editorWidth }: { editorWidth: number }) {
  // Access resource settings state and update function
  const {
    settingOpenResourceId, // You need to add this in your store, analogous to node's settingOpenNodeId
    resources,
    updateResource,
  } = useTerraformResourceStore();

  if (!settingOpenResourceId) return null; // Nothing to edit if no resource selected

  // Find the resource currently being edited
  const resource = resources.find((r) => r.id === settingOpenResourceId);
  if (!resource) return null;

  // Handle form changes for resource.data fields (assuming data is an object)
  const handleChange = (key: string, value: string) => {
    updateResource(settingOpenResourceId, { [key]: value });
  };

  return (
    <div
      className="fixed top-17 h-[calc(97vh-48px)] bg-[#232329] text-white shadow-lg z-[1001] rounded-l-md flex flex-col"
      style={{ right: `${editorWidth}px`, width: "350px" }}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2e2e32]">
        <h2 className="text-lg font-semibold">Resource Settings</h2>
        <button
          onClick={closeSettingsorConfig}
          title="Close Resource Settings"
          className="text-red-400 hover:text-red-600 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1 scrollbar-hide">
        {/* Currently only editing "label", add more fields as needed */}
        <div className="mb-4">
          <label className="block text-sm mb-1 font-medium text-gray-300">Label</label>
          <input
            type="text"
            value={resource.data.label}
            onChange={(e) => handleChange("label", e.target.value)}
            className="w-full px-3 py-2 bg-[#2a2a2e] text-white rounded-md border border-[#3b3b3f] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add more editable fields here dynamically if needed */}
      </div>

      <div className="px-4 py-3 border-t border-[#2e2e32]">
        <button
          onClick={closeSettingsorConfig}
          className="w-full bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
}

export default ResourceSettingsPanel;
